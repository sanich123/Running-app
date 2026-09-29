import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';
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
import type { ActivityRouteReplayProps, ReplayMapHandle } from './types';

export default function ActivityRouteReplay(props: ActivityRouteReplayProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const activityMapRef = useRef<ReplayMapHandle>(null);
  const route = useRouteData(props);
  const playback = useRoutePlayback(route.timeline, activityMapRef);
  const mapControls = useMapControls(activityMapRef);
  const copy = ACTIVITY_ROUTE_REPLAY_TEXT[language];
  const videoExport = useVideoExport({ playback, copy, workoutDate: props.workoutDate });

  return (
    <View style={styles.container} onLayout={videoExport.onLayout}>
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
          />
          {videoExport.isExporting ? (
            <Pressable onPress={() => undefined} style={styles.exportBlocker}>
              <Surface style={styles.exportStatus}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text variant="bodyMedium" style={[styles.exportMessage, { color: colors.onSurface }]}>
                  {copy.exportProgress}
                </Text>
                {copy.exportStayOnPage ? (
                  <Text variant="bodySmall" style={[styles.exportMessage, { color: colors.onSurfaceVariant }]}>
                    {copy.exportStayOnPage}
                  </Text>
                ) : null}
                <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                  {Math.round(videoExport.progress * 100)}%
                </Text>
              </Surface>
            </Pressable>
          ) : null}
          <MapTools
            mapStyle={mapControls.mapStyle}
            playbackSpeed={playback.playbackSpeed}
            playbackDuration={playback.playbackDuration}
            copy={copy}
            onZoomIn={mapControls.zoomIn}
            onZoomOut={mapControls.zoomOut}
            onMapStyleChange={mapControls.setMapStyle}
            onSetPlaybackSpeed={playback.setPlaybackSpeed}
            onSetPlaybackDuration={playback.setPlaybackDuration}
            canZoomIn={mapControls.canZoomIn}
            canZoomOut={mapControls.canZoomOut}
            isDisabled={videoExport.isExporting}
          />
          <Controls
            progress={playback.progress}
            hasStarted={playback.hasStarted}
            isPlaying={playback.isPlaying}
            playbackTime={playback.playbackWallDuration * playback.progress}
            playbackDuration={playback.playbackWallDuration}
            workoutTime={route.workoutDuration * playback.progress}
            currentSpeed={playback.currentSpeed}
            isDisabled={videoExport.isExporting}
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
      ) : (
        <EmptyState message={copy.insufficientData} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  exportBlocker: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  exportStatus: {
    alignItems: 'center',
    borderRadius: 14,
    elevation: 5,
    maxWidth: '90%',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  exportMessage: { maxWidth: 280, textAlign: 'center' },
});
