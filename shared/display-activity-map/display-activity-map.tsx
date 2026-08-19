import { useMemo, useRef, useState } from 'react';
import { MapView, Camera } from '@rnmapbox/maps';
import { Platform, View, StyleSheet } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import ActivityMapMarkers from './activity-map-markers/activity-map-markers';
import MapKmSplit from './map-km-split/map-km-split';
import RouteLine from './map-route-line/map-route-line';
import MapboxWeb from './mapbox-web/mapbox-web';
import { getActivityMapBounds } from './utils';
import type { DisplayActivityMapProps } from '@S/card/types';

export default function DisplayActivityMap({ locations, kilometresSplit }: DisplayActivityMapProps) {
  const { colors } = useTheme();
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(14);
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

  if (!mapData) {
    return (
      <View style={styles.emptyState}>
        <Text variant="bodyLarge">Недостаточно данных для отображения маршрута</Text>
      </View>
    );
  }

  const { boundBox, bounds, routeCoordinates } = mapData;

  return (
    <>
      {Platform.OS === 'web' ? (
        <MapboxWeb kilometresSplit={kilometresSplit} boundBox={boundBox} routeCoordinates={routeCoordinates} />
      ) : (
        <View style={styles.mapWrapper}>
          <MapView style={[{ flex: 1 }]}>
            <Camera
              ref={cameraRef}
              animationMode="flyTo"
              animationDuration={1000}
              bounds={bounds}
              padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
            />
            <RouteLine locations={validLocations} />
            <MapKmSplit kilometresSplit={kilometresSplit} />
            <ActivityMapMarkers locations={validLocations} />
          </MapView>
          <View style={styles.zoomControls}>
            <IconButton
              testID="activity-map-increase-zoom"
              mode="contained-tonal"
              icon="plus"
              iconColor={colors.primary}
              containerColor={colors.surface}
              onPress={() => {
                const nextZoomLevel = Math.min(20, zoomLevel + 1);
                setZoomLevel(nextZoomLevel);
                cameraRef.current?.zoomTo(nextZoomLevel, 250);
              }}
              disabled={zoomLevel >= 20}
              accessibilityLabel="Увеличить масштаб карты"
            />
            <IconButton
              testID="activity-map-decrease-zoom"
              mode="contained-tonal"
              icon="minus"
              iconColor={colors.primary}
              containerColor={colors.surface}
              onPress={() => {
                const nextZoomLevel = Math.max(3, zoomLevel - 1);
                setZoomLevel(nextZoomLevel);
                cameraRef.current?.zoomTo(nextZoomLevel, 250);
              }}
              disabled={zoomLevel <= 3}
              accessibilityLabel="Уменьшить масштаб карты"
            />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  mapWrapper: { flex: 1, position: 'relative' },
  zoomControls: { position: 'absolute', right: 12, bottom: 24, gap: 4 },
});
