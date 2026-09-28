import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, MapView, MarkerView, RasterDemSource, Terrain } from '@rnmapbox/maps';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ActivityMapMarkers from '@S/display-activity-map/activity-map-markers/activity-map-markers';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import MapboxWeb from '@S/display-activity-map/mapbox-web/mapbox-web';
import { getActivityMapBounds } from '@S/display-activity-map/utils';
import {
  ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH,
  ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL,
  ACTIVITY_ROUTE_REPLAY_DURATION_MS,
  ACTIVITY_ROUTE_REPLAY_MAP_STYLE_URL,
  ACTIVITY_ROUTE_REPLAY_TEXT,
  ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION,
  ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL,
} from './const';
import { createRouteTimeline, getRouteCoordinateAtProgress, getRouteHeadingAtProgress } from './utils';
import type { ActivityLocation } from '@S/card/types';

export default function ActivityRouteReplay({ locations }: { locations: ActivityLocation[] }) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = ACTIVITY_ROUTE_REPLAY_TEXT[language];
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressRef = useRef(0);
  const seekWidthRef = useRef(0);
  const cameraRef = useRef<Camera>(null);
  const lastCameraUpdateAtRef = useRef(0);
  const validLocations = useMemo(
    () => locations.filter(({ coords }) => Number.isFinite(coords?.longitude) && Number.isFinite(coords?.latitude)),
    [locations],
  );
  const timeline = useMemo(() => createRouteTimeline(validLocations), [validLocations]);
  const mapData = useMemo(
    () => (timeline.coordinates.length >= 2 ? getActivityMapBounds(validLocations) : null),
    [timeline, validLocations],
  );
  const playbackCoordinate = useMemo(() => getRouteCoordinateAtProgress(timeline, progress), [progress, timeline]);
  const playbackHeading = useMemo(() => getRouteHeadingAtProgress(timeline, progress), [progress, timeline]);

  useEffect(() => {
    if (!isPlaying || timeline.coordinates.length < 2) return undefined;

    const startedAt = performance.now() - progressRef.current * ACTIVITY_ROUTE_REPLAY_DURATION_MS;
    let animationFrame = 0;
    let lastUpdateAt = 0;

    const updateProgress = (timestamp: number) => {
      const nextProgress = Math.min((timestamp - startedAt) / ACTIVITY_ROUTE_REPLAY_DURATION_MS, 1);
      if (timestamp - lastUpdateAt >= 33 || nextProgress >= 1) {
        lastUpdateAt = timestamp;
        progressRef.current = nextProgress;
        setProgress(nextProgress);
      }
      if (nextProgress >= 1) {
        setIsPlaying(false);
        return;
      }
      animationFrame = requestAnimationFrame(updateProgress);
    };

    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, timeline.coordinates.length]);

  useEffect(() => {
    if (Platform.OS === 'web' || !playbackCoordinate) return;
    const now = performance.now();
    const animationDuration = isPlaying && lastCameraUpdateAtRef.current > 0 ? 120 : 0;
    if (isPlaying && now - lastCameraUpdateAtRef.current < 100) return;
    lastCameraUpdateAtRef.current = now;
    cameraRef.current?.setCamera({
      centerCoordinate: playbackCoordinate,
      heading: playbackHeading,
      pitch: ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH,
      zoomLevel: ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL,
      animationMode: animationDuration ? 'easeTo' : 'moveTo',
      animationDuration,
    });
  }, [isPlaying, playbackCoordinate, playbackHeading]);

  const handlePlaybackPress = () => {
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setProgress(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((previous) => !previous);
  };

  const handleSeek = (locationX: number, width: number) => {
    if (!width) return;
    const nextProgress = Math.max(0, Math.min(1, locationX / width));
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    setIsPlaying(false);
  };

  if (!mapData || !playbackCoordinate) {
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
        <Icon source="map-marker-path" size={40} color={colors.onSurfaceVariant} />
        <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {copy.insufficientData}
        </Text>
      </View>
    );
  }

  const playbackControls = (
    <View style={[styles.controls, { backgroundColor: colors.surface }]}>
      <Pressable
        style={styles.seekHitbox}
        onLayout={(event) => {
          seekWidthRef.current = event.nativeEvent.layout.width;
        }}
        onPress={(event) => handleSeek(event.nativeEvent.locationX, seekWidthRef.current)}
        accessibilityRole="adjustable"
        accessibilityLabel={language === 'russian' ? 'Позиция маршрута' : 'Route position'}>
        <View style={[styles.seekTrack, { backgroundColor: colors.surfaceVariant }]}>
          <View style={[styles.seekFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
        </View>
      </Pressable>
      <View style={styles.controlRow}>
        <IconButton
          icon={progress >= 1 ? 'replay' : isPlaying ? 'pause' : 'play'}
          iconColor={colors.primary}
          size={28}
          onPress={handlePlaybackPress}
          accessibilityLabel={progress >= 1 ? copy.replay : isPlaying ? copy.pause : copy.resume}
          testID="activity-route-replay-toggle"
        />
        <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
          {isPlaying ? copy.pause : progress >= 1 ? copy.replay : copy.resume}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <MapboxWeb
          boundBox={mapData.boundBox}
          routeCoordinates={timeline.coordinates}
          kilometresSplit={[]}
          showPlaybackMarker
          playbackCoordinate={playbackCoordinate}
          playbackHeading={playbackHeading}
          mapStyleURL={ACTIVITY_ROUTE_REPLAY_MAP_STYLE_URL}
          cameraPitch={ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH}
          cameraZoomLevel={ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL}
          enable3DTerrain
          followPlaybackCamera
        />
      ) : (
        <MapView style={styles.map} styleURL={ACTIVITY_ROUTE_REPLAY_MAP_STYLE_URL}>
          <Camera
            ref={cameraRef}
            animationMode="flyTo"
            animationDuration={0}
            defaultSettings={{
              centerCoordinate: playbackCoordinate,
              heading: playbackHeading,
              pitch: ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH,
              zoomLevel: ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL,
            }}
          />
          <RasterDemSource
            id="activity-route-replay-terrain"
            url={ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL}
            tileSize={512}
            maxZoomLevel={14}>
            <Terrain style={{ exaggeration: ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION }} />
          </RasterDemSource>
          <MapRouteLine locations={validLocations} />
          <ActivityMapMarkers locations={validLocations} />
          <MarkerView coordinate={playbackCoordinate} anchor={{ x: 0.5, y: 0.5 }} allowOverlap>
            <View
              style={[styles.playbackMarker, { backgroundColor: colors.primary }]}
              testID="activity-route-moving-marker"
            />
          </MarkerView>
        </MapView>
      )}
      {playbackControls}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  emptyState: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  controls: {
    borderRadius: 16,
    bottom: 16,
    elevation: 6,
    left: 16,
    paddingBottom: 4,
    paddingHorizontal: 12,
    paddingTop: 8,
    position: 'absolute',
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  seekHitbox: { justifyContent: 'center', minHeight: 24 },
  seekTrack: { borderRadius: 4, height: 4, overflow: 'hidden', width: '100%' },
  seekFill: { borderRadius: 4, height: '100%' },
  controlRow: { alignItems: 'center', flexDirection: 'row', minHeight: 44 },
  playbackMarker: {
    borderColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    elevation: 6,
    height: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 24,
  },
});
