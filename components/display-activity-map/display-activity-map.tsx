import { useMemo } from 'react';
import { MapView, Camera } from '@rnmapbox/maps';
import getBbox from '@turf/bbox';
import lineString from 'turf-linestring';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MapboxWeb from '@C/map-page/mapbox-web/mapbox-web';
import MapKmSplit from '../activity/map/map-km-split/map-km-split';
import RouteLine from '../activity/map/map-route-line/map-route-line';
import type { DisplayActivityMapProps } from '@C/card/types';

export default function DisplayActivityMap({ locations, kilometresSplit }: DisplayActivityMapProps) {
  const validLocations = useMemo(
    () =>
      (Array.isArray(locations) ? locations : []).filter((location) => {
        const { longitude, latitude } = location?.coords ?? {};
        return Number.isFinite(longitude) && Number.isFinite(latitude);
      }),
    [locations],
  );

  const modifiedLocationsForTurf = useMemo(
    () => validLocations.map(({ coords: { longitude, latitude } }) => [latitude, longitude]),
    [validLocations],
  );
  const modifiedLocationsForMapboxGl = useMemo(
    () => validLocations.map(({ coords: { longitude, latitude } }) => [longitude, latitude]),
    [validLocations],
  );

  if (validLocations.length < 2) {
    return (
      <View style={styles.emptyState}>
        <Text variant="bodyLarge">Недостаточно данных для отображения маршрута</Text>
      </View>
    );
  }

  const line = lineString(modifiedLocationsForTurf);
  const [minLat, minLng, maxLat, maxLng] = getBbox(line);

  return (
    <>
      {Platform.OS === 'web' ? (
        <MapboxWeb
          kilometresSplit={kilometresSplit}
          boundBox={[minLng, maxLat, maxLng, minLat]}
          modifiedLocationsForTurf={modifiedLocationsForMapboxGl}
        />
      ) : (
        <MapView style={[{ flex: 1 }]}>
          <Camera
            animationMode="flyTo"
            animationDuration={1000}
            bounds={{ ne: [minLng, minLat], sw: [maxLng, maxLat] }}
            padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
          />
          <RouteLine locations={validLocations} />
          <MapKmSplit kilometresSplit={kilometresSplit} />
        </MapView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
});
