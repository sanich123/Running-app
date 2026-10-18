import { useMemo, useRef, useState } from 'react';
import { Camera, MapView } from '@rnmapbox/maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import {
  ACTIVITY_ROUTE_REPLAY_INITIAL_CONTROLS_HEIGHT,
  ACTIVITY_ROUTE_REPLAY_MAPBOX_ANDROID_ATTRIBUTION_LEFT_INSET,
  ACTIVITY_ROUTE_REPLAY_MAPBOX_ATTRIBUTION_LEFT_INSET,
  ACTIVITY_ROUTE_REPLAY_MAPBOX_LOGO_LEFT_INSET,
  getActivityRouteReplayMapboxBrandingBottomOffset,
  getActivityRouteReplayMapControlsBottomOffset,
} from '@S/activity-route-replay/const';
import ActivityMapMarkers from './activity-map-markers/activity-map-markers';
import {
  DISPLAY_ACTIVITY_MAP_CAMERA_PADDING,
  DISPLAY_ACTIVITY_MAP_INITIAL_ZOOM,
  DISPLAY_ACTIVITY_MAP_MAX_ZOOM,
  DISPLAY_ACTIVITY_MAP_MIN_ZOOM,
  DISPLAY_ACTIVITY_MAP_STYLES,
  DISPLAY_ACTIVITY_MAP_TEXT,
} from './const';
import MapControls from './map-controls/map-controls';
import RouteLine from './map-route-line/map-route-line';
import MapboxWeb from './mapbox-web/mapbox-web';
import RouteKilometreMarkers from './route-kilometre-markers/route-kilometre-markers';
import { getActivityMapBounds, getRouteSpeedColors } from './utils';
import type { DisplayMapStyle, WebMapControlsHandle } from './map-controls/types';
import type { DisplayActivityMapProps } from '@S/card/types';

export default function DisplayActivityMap({ locations, kilometresSplit }: DisplayActivityMapProps) {
  const { colors } = useTheme();
  const { bottom: safeAreaBottomInset } = useSafeAreaInsets();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = DISPLAY_ACTIVITY_MAP_TEXT[language];
  const cameraRef = useRef<Camera>(null);
  const webMapControlsRef = useRef<WebMapControlsHandle>(null);
  const [zoomLevel, setZoomLevel] = useState(DISPLAY_ACTIVITY_MAP_INITIAL_ZOOM);
  const [mapStyle, setMapStyle] = useState<DisplayMapStyle>('map');
  const validLocations = useMemo(
    () =>
      (Array.isArray(locations) ? locations : []).filter((location) => {
        const { longitude, latitude } = location?.coords ?? {};
        return Number.isFinite(longitude) && Number.isFinite(latitude);
      }),
    [locations],
  );
  const mapData = useMemo(
    () => (validLocations.length >= 2 ? getActivityMapBounds(validLocations) : null),
    [validLocations],
  );
  const routeSegmentColors = useMemo(() => getRouteSpeedColors(validLocations), [validLocations]);

  return (
    <View style={styles.mapWrapper}>
      {mapData ? (
        <>
          {Platform.OS === 'web' ? (
            <MapboxWeb
              boundBox={mapData.boundBox}
              routeCoordinates={mapData.routeCoordinates}
              routeSegmentColors={routeSegmentColors}
              kilometresSplit={kilometresSplit}
              kilometreUnit={copy.kilometreUnit}
              mapStyleURL={DISPLAY_ACTIVITY_MAP_STYLES[mapStyle]}
              mapControlsRef={webMapControlsRef}
            />
          ) : (
            <MapView
              style={styles.map}
              styleURL={DISPLAY_ACTIVITY_MAP_STYLES[mapStyle]}
              logoPosition={{
                bottom:
                  Platform.OS === 'ios' ? 0 : getActivityRouteReplayMapboxBrandingBottomOffset(safeAreaBottomInset),
                left: ACTIVITY_ROUTE_REPLAY_MAPBOX_LOGO_LEFT_INSET,
              }}
              attributionPosition={{
                bottom:
                  Platform.OS === 'ios' ? 0 : getActivityRouteReplayMapboxBrandingBottomOffset(safeAreaBottomInset),
                left:
                  Platform.OS === 'android'
                    ? ACTIVITY_ROUTE_REPLAY_MAPBOX_ANDROID_ATTRIBUTION_LEFT_INSET
                    : ACTIVITY_ROUTE_REPLAY_MAPBOX_ATTRIBUTION_LEFT_INSET,
              }}
              scaleBarEnabled={false}>
              <Camera
                ref={cameraRef}
                animationMode="flyTo"
                animationDuration={1000}
                bounds={mapData.bounds}
                padding={DISPLAY_ACTIVITY_MAP_CAMERA_PADDING}
              />
              <RouteLine locations={validLocations} segmentColors={routeSegmentColors} />
              <RouteKilometreMarkers kilometresSplit={kilometresSplit} kilometreUnit={copy.kilometreUnit} />
              <ActivityMapMarkers locations={validLocations} />
            </MapView>
          )}
          <MapControls
            mapStyle={mapStyle}
            copy={copy}
            onZoomIn={() => {
              const nextZoomLevel = Math.min(DISPLAY_ACTIVITY_MAP_MAX_ZOOM, zoomLevel + 1);
              setZoomLevel(nextZoomLevel);
              if (Platform.OS === 'web') {
                webMapControlsRef.current?.zoomTo(nextZoomLevel, 250);
              } else {
                cameraRef.current?.zoomTo(nextZoomLevel, 250);
              }
            }}
            onZoomOut={() => {
              const nextZoomLevel = Math.max(DISPLAY_ACTIVITY_MAP_MIN_ZOOM, zoomLevel - 1);
              setZoomLevel(nextZoomLevel);
              if (Platform.OS === 'web') {
                webMapControlsRef.current?.zoomTo(nextZoomLevel, 250);
              } else {
                cameraRef.current?.zoomTo(nextZoomLevel, 250);
              }
            }}
            onMapStyleChange={setMapStyle}
            canZoomIn={zoomLevel < DISPLAY_ACTIVITY_MAP_MAX_ZOOM}
            canZoomOut={zoomLevel > DISPLAY_ACTIVITY_MAP_MIN_ZOOM}
            bottomOffset={getActivityRouteReplayMapControlsBottomOffset(
              ACTIVITY_ROUTE_REPLAY_INITIAL_CONTROLS_HEIGHT,
              safeAreaBottomInset,
            )}
            testIdPrefix="activity-map"
          />
        </>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
          <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
            {copy.insufficientData}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  map: { flex: 1 },
  mapWrapper: { flex: 1, position: 'relative' },
});
