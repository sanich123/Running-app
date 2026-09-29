import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Camera, MapView, RasterDemSource, Terrain } from '@rnmapbox/maps';
import { Platform, StyleSheet } from 'react-native';
import ActivityMapMarkers from '@S/display-activity-map/activity-map-markers/activity-map-markers';
import MapRouteLine from '@S/display-activity-map/map-route-line/map-route-line';
import MapboxWeb from '@S/display-activity-map/mapbox-web/mapbox-web';
import UserAvatarMarker from '@S/display-activity-map/user-avatar-marker/user-avatar-marker';
import {
  ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH,
  ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL,
  ACTIVITY_ROUTE_REPLAY_MAP_STYLES,
  ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION,
  ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL,
} from '../const';
import { ReplayRecordingView } from '../video-export/recording-view';
import type { CameraUpdate, ReplayMapHandle, ReplayMapProps } from '../types';

const ReplayMap = forwardRef<ReplayMapHandle, ReplayMapProps>(function ReplayMap(
  {
    locations,
    boundBox,
    routeCoordinates,
    routeSegmentColors,
    mapStyle,
    playbackCoordinate,
    playbackHeading,
    profile,
    recordingSessionId,
  },
  ref,
) {
  const cameraRef = useRef<Camera>(null);
  const webCameraUpdateRef = useRef<CameraUpdate | null>(null);
  const zoomLevelRef = useRef(ACTIVITY_ROUTE_REPLAY_CAMERA_ZOOM_LEVEL);
  const playbackCoordinateRef = useRef(playbackCoordinate);
  const playbackHeadingRef = useRef(playbackHeading);

  useImperativeHandle(
    ref,
    () => ({
      updateCamera(coordinate, heading, zoomLevel, animationDurationMs = 0) {
        playbackCoordinateRef.current = coordinate;
        playbackHeadingRef.current = heading;
        if (zoomLevel !== undefined) zoomLevelRef.current = zoomLevel;

        if (Platform.OS === 'web') {
          webCameraUpdateRef.current?.(coordinate, heading, zoomLevel);
          return;
        }

        cameraRef.current?.setCamera({
          centerCoordinate: coordinate,
          heading,
          pitch: ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH,
          zoomLevel: zoomLevelRef.current,
          animationMode: animationDurationMs > 0 ? 'easeTo' : 'moveTo',
          animationDuration: animationDurationMs,
        });
      },
      setZoomLevel(zoomLevel) {
        zoomLevelRef.current = zoomLevel;
        if (Platform.OS === 'web') {
          webCameraUpdateRef.current?.(playbackCoordinateRef.current, playbackHeadingRef.current, zoomLevel);
          return;
        }

        cameraRef.current?.setCamera({
          centerCoordinate: playbackCoordinateRef.current,
          heading: playbackHeadingRef.current,
          pitch: ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH,
          zoomLevel,
          animationMode: 'moveTo',
          animationDuration: 0,
        });
      },
    }),
    [],
  );

  return Platform.OS === 'web' ? (
    <MapboxWeb
      boundBox={boundBox}
      routeCoordinates={routeCoordinates}
      routeSegmentColors={routeSegmentColors}
      kilometresSplit={[]}
      showPlaybackMarker
      playbackCoordinate={playbackCoordinate}
      playbackHeading={playbackHeading}
      playbackCameraUpdateRef={webCameraUpdateRef}
      playbackProfile={profile}
      mapStyleURL={ACTIVITY_ROUTE_REPLAY_MAP_STYLES[mapStyle]}
      cameraPitch={ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH}
      cameraZoomLevel={zoomLevelRef.current}
      enable3DTerrain
      followPlaybackCamera
    />
  ) : (
    <ReplayRecordingView sessionId={recordingSessionId ?? 'activity-route-replay'}>
      <MapView
        style={styles.map}
        styleURL={ACTIVITY_ROUTE_REPLAY_MAP_STYLES[mapStyle]}
        scaleBarEnabled={false}
        surfaceView={false}>
        <Camera
          ref={cameraRef}
          animationMode="flyTo"
          animationDuration={0}
          defaultSettings={{
            centerCoordinate: playbackCoordinate,
            heading: playbackHeading,
            pitch: ACTIVITY_ROUTE_REPLAY_CAMERA_PITCH,
            zoomLevel: zoomLevelRef.current,
          }}
        />
        <RasterDemSource
          id="activity-route-replay-terrain"
          url={ACTIVITY_ROUTE_REPLAY_TERRAIN_SOURCE_URL}
          tileSize={512}
          maxZoomLevel={14}>
          <Terrain style={{ exaggeration: ACTIVITY_ROUTE_REPLAY_TERRAIN_EXAGGERATION }} />
        </RasterDemSource>
        <MapRouteLine locations={locations} segmentColors={routeSegmentColors} />
        <ActivityMapMarkers locations={locations} />
        <UserAvatarMarker
          coordinate={playbackCoordinate}
          profilePhoto={profile?.profilePhoto}
          placeholder={profile?.profilePhotoBlurhash}
          name={profile?.name}
          surname={profile?.surname}
          markerTestID="activity-route-moving-marker"
          testID="activity-route-moving-avatar"
        />
      </MapView>
    </ReplayRecordingView>
  );
});

export default ReplayMap;

const styles = StyleSheet.create({
  map: { flex: 1 },
});
