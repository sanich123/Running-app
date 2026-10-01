import { useEffect, useRef } from 'react';
import { useKeepAwake } from 'expo-keep-awake';
import { SystemBars } from 'react-native-edge-to-edge';
import { Platform, StyleSheet, View } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { ACTIVITY_ROUTE_REPLAY_TEXT } from './const';
import Controls from './controls/controls';
import EmptyState from './empty-state/empty-state';
import ReplayMap from './map/map';
import MapTools from './map-tools/map-tools';
import useMapControls from './use-map-controls';
import useRouteData from './use-route-data';
import useRoutePlayback from './use-route-playback';
import useVideoExport from './video-export/use-video-export';
import VideoBrandOverlay from './video-export/video-brand-overlay';
import VideoExportLoader from './video-export/video-export-loader';
import type { ActivityRouteReplayProps, ReplayMapHandle } from './types';

export default function ActivityRouteReplay(props: ActivityRouteReplayProps) {
  const { onVideoExportStateChange } = props;
  const { language } = useAppSelector(({ settings }) => settings);
  const activityMapRef = useRef<ReplayMapHandle>(null);
  const route = useRouteData(props);
  const playback = useRoutePlayback(route.timeline, activityMapRef);
  const mapControls = useMapControls(activityMapRef);
  const copy = ACTIVITY_ROUTE_REPLAY_TEXT[language];
  const videoExport = useVideoExport({ playback, copy, workoutDate: props.workoutDate });

  useEffect(() => {
    onVideoExportStateChange?.(videoExport.isExporting);
  }, [onVideoExportStateChange, videoExport.isExporting]);

  return (
    <View
      pointerEvents={videoExport.isExporting ? 'none' : 'auto'}
      style={styles.container}
      onLayout={videoExport.onLayout}>
      {videoExport.isExporting ? <KeepAwakeDuringVideoExport /> : null}
      {playback.isPlaying && !videoExport.isExporting ? <KeepAwakeDuringReplay /> : null}
      {videoExport.isExporting && Platform.OS !== 'web' ? (
        <SystemBars hidden={{ statusBar: true, navigationBar: true }} />
      ) : null}
      <ConfirmDialog
        visible={Boolean(videoExport.readyVideo)}
        title={copy.videoReady}
        message={`${copy.videoSize}: ${videoExport.readyVideo?.size ?? ''}`}
        confirmText={copy.share}
        cancelText={copy.cancel}
        onConfirm={videoExport.shareReadyVideo}
        onDismiss={videoExport.dismissReadyVideo}
      />
      <VideoExportLoader
        visible={videoExport.isExporting}
        title={copy.exportProgress}
        message={copy.exportStayOnPage ?? ''}
        cancelLabel={copy.cancel}
        onCancel={videoExport.cancelVideoExport}
      />
      {route.mapData && playback.playbackCoordinate ? (
        <>
          <ReplayMap
            ref={activityMapRef}
            locations={route.validLocations}
            boundBox={route.mapData.boundBox}
            routeCoordinates={route.timeline.coordinates}
            routeSegmentColors={route.timeline.segmentColors}
            mapStyle={mapControls.mapStyle}
            playbackCoordinate={playback.playbackCoordinate}
            playbackHeading={playback.playbackHeading}
            profile={props.profile}
            recordingSessionId={videoExport.recorder.sessionId}
            recordingOverlay={
              videoExport.isExporting ? (
                <VideoBrandOverlay
                  sport={props.sport}
                  workoutDate={props.workoutDate}
                  profile={props.profile}
                  workoutDuration={route.workoutDuration}
                  distance={route.timeline.totalDistance}
                  progress={playback.progress}
                  currentSpeed={playback.currentSpeed}
                  language={language}
                  copy={copy}
                  isCoverFrame={videoExport.isCoverFrame}
                  onCoverReady={videoExport.onCoverReady}
                />
              ) : null
            }
            showRouteEndpointMarkers={!videoExport.isExporting}
          />
          {videoExport.isExporting ? null : (
            <>
              <MapTools
                mapStyle={mapControls.mapStyle}
                playbackDuration={playback.playbackDuration}
                copy={copy}
                onZoomIn={mapControls.zoomIn}
                onZoomOut={mapControls.zoomOut}
                onMapStyleChange={mapControls.setMapStyle}
                onSetPlaybackDuration={playback.setPlaybackDuration}
                canZoomIn={mapControls.canZoomIn}
                canZoomOut={mapControls.canZoomOut}
              />
              <Controls
                progress={playback.progress}
                hasStarted={playback.hasStarted}
                isPlaying={playback.isPlaying}
                playbackTime={playback.playbackDuration * playback.progress}
                playbackDuration={playback.playbackDuration}
                workoutTime={route.workoutDuration * playback.progress}
                currentSpeed={playback.currentSpeed}
                isVideoExportAvailable={videoExport.recorder.isAvailable && Boolean(props.workoutDate)}
                isExporting={videoExport.isExporting}
                copy={copy}
                onTogglePlayback={playback.togglePlayback}
                onShareVideo={videoExport.shareVideo}
                onSeekStart={playback.startSeeking}
                onSeek={playback.seekToProgress}
                onSeekEnd={playback.finishSeeking}
              />
            </>
          )}
        </>
      ) : (
        <EmptyState message={copy.insufficientData} />
      )}
    </View>
  );
}

function KeepAwakeDuringVideoExport() {
  useKeepAwake('activity-route-replay-video-export', { suppressDeactivateWarnings: true });
  return null;
}

function KeepAwakeDuringReplay() {
  useKeepAwake('activity-route-replay-playback', { suppressDeactivateWarnings: true });
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
});
