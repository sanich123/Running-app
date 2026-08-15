import { useMemo } from 'react';
import { MapView, Camera } from '@rnmapbox/maps';
import getBbox from '@turf/bbox';
import lineString from 'turf-linestring';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ActivityMapMarkers from './activity-map-markers/activity-map-markers';
import MapKmSplit from './map-km-split/map-km-split';
import RouteLine from './map-route-line/map-route-line';
import MapboxWeb from './mapbox-web/mapbox-web';
import type { ActivityLocation, DisplayActivityMapProps } from '@S/card/types';

export function getActivityMapBounds(locations: ActivityLocation[]) {
  const routeCoordinates = locations.map(({ coords: { longitude, latitude } }) => [longitude, latitude]);
  const [minLng, minLat, maxLng, maxLat] = getBbox(lineString(routeCoordinates));

  return {
    boundBox: [minLng, minLat, maxLng, maxLat] as [number, number, number, number],
    bounds: {
      ne: [maxLng, maxLat] as [number, number],
      sw: [minLng, minLat] as [number, number],
    },
    routeCoordinates,
  };
}

export default function DisplayActivityMap({ locations, kilometresSplit }: DisplayActivityMapProps) {
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
        <MapView style={[{ flex: 1 }]}>
          <Camera
            animationMode="flyTo"
            animationDuration={1000}
            bounds={bounds}
            padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
          />
          <RouteLine locations={validLocations} />
          <MapKmSplit kilometresSplit={kilometresSplit} />
          <ActivityMapMarkers locations={validLocations} />
        </MapView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
});
