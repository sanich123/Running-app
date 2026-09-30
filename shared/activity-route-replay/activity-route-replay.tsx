import { useRef } from 'react';
import { useKeepAwake } from 'expo-keep-awake';
import { SystemBars } from 'react-native-edge-to-edge';
import { Platform, StyleSheet, View } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
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
import type { ActivityRouteReplayProps, ReplayMapHandle } from './types';

export default function ActivityRouteReplay(props: ActivityRouteReplayProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const activityMapRef = useRef<ReplayMapHandle>(null);
  const route = useRouteData(props);
  const playback = useRoutePlayback(route.timeline, activityMapRef);
  const mapControls = useMapControls(activityMapRef);
  const copy = ACTIVITY_ROUTE_REPLAY_TEXT[language];
  const videoExport = useVideoExport({ playback, copy, workoutDate: props.workoutDate });

  return (
    <View
      pointerEvents={videoExport.isExporting ? 'none' : 'auto'}
      style={styles.container}
      onLayout={videoExport.onLayout}>
      {videoExport.isExporting ? <KeepAwakeDuringVideoExport /> : null}
      {videoExport.isExporting && Platform.OS !== 'web' ? (
        <SystemBars hidden={{ statusBar: true, navigationBar: true }} />
      ) : null}
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
            showRouteEndpointMarkers={!videoExport.isExporting}
          />
          {videoExport.isExporting ? (
            <VideoBrandOverlay
              sport={props.sport}
              workoutDate={props.workoutDate}
              workoutDuration={route.workoutDuration}
              distance={route.timeline.totalDistance}
              progress={playback.progress}
              currentSpeed={playback.currentSpeed}
              language={language}
              copy={copy}
            />
          ) : (
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

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
});
