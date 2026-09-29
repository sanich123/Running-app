import { useMemo, useRef, useState } from 'react';
import { Camera, MapView } from '@rnmapbox/maps';
import { Platform, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import ActivityMapMarkers from './activity-map-markers/activity-map-markers';
import {
  DISPLAY_ACTIVITY_MAP_INITIAL_ZOOM,
  DISPLAY_ACTIVITY_MAP_MAX_ZOOM,
  DISPLAY_ACTIVITY_MAP_MIN_ZOOM,
  DISPLAY_ACTIVITY_MAP_STYLES,
  DISPLAY_ACTIVITY_MAP_TEXT,
} from './const';
import MapControls from './map-controls/map-controls';
import MapKmSplit from './map-km-split/map-km-split';
import RouteLine from './map-route-line/map-route-line';
import MapboxWeb from './mapbox-web/mapbox-web';
import { getActivityMapBounds, getRouteSpeedColors } from './utils';
import type { DisplayMapStyle, WebMapControlsHandle } from './map-controls/types';
import type { DisplayActivityMapProps } from '@S/card/types';

export default function DisplayActivityMap({ locations, kilometresSplit }: DisplayActivityMapProps) {
  const { colors } = useTheme();
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

  const zoomIn = () => {
    const nextZoomLevel = Math.min(DISPLAY_ACTIVITY_MAP_MAX_ZOOM, zoomLevel + 1);
    setZoomLevel(nextZoomLevel);
    if (Platform.OS === 'web') {
      webMapControlsRef.current?.zoomTo(nextZoomLevel, 250);
    } else {
      cameraRef.current?.zoomTo(nextZoomLevel, 250);
    }
  };
  const zoomOut = () => {
    const nextZoomLevel = Math.max(DISPLAY_ACTIVITY_MAP_MIN_ZOOM, zoomLevel - 1);
    setZoomLevel(nextZoomLevel);
    if (Platform.OS === 'web') {
      webMapControlsRef.current?.zoomTo(nextZoomLevel, 250);
    } else {
      cameraRef.current?.zoomTo(nextZoomLevel, 250);
    }
  };

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
              mapStyleURL={DISPLAY_ACTIVITY_MAP_STYLES[mapStyle]}
              mapControlsRef={webMapControlsRef}
            />
          ) : (
            <MapView style={styles.map} styleURL={DISPLAY_ACTIVITY_MAP_STYLES[mapStyle]}>
              <Camera
                ref={cameraRef}
                animationMode="flyTo"
                animationDuration={1000}
                bounds={mapData.bounds}
                padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
              />
              <RouteLine locations={validLocations} segmentColors={routeSegmentColors} />
              <MapKmSplit kilometresSplit={kilometresSplit} />
              <ActivityMapMarkers locations={validLocations} />
            </MapView>
          )}
          <MapControls
            mapStyle={mapStyle}
            copy={copy}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onMapStyleChange={setMapStyle}
            canZoomIn={zoomLevel < DISPLAY_ACTIVITY_MAP_MAX_ZOOM}
            canZoomOut={zoomLevel > DISPLAY_ACTIVITY_MAP_MIN_ZOOM}
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
