import ErrorComponent from '@C/error-component/error-component';
import MapKmSplit from '@C/map-km-split/map-km-split';
import MapRouteLine from '@C/map-route-line/map-route-line';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { MapView, Camera } from '@rnmapbox/maps';
import bbox from '@turf/bbox';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
//@ts-ignore
import lineString from 'turf-linestring';

export default function DisplayActivityMap() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(`${activityId}`);
  const modifiedLocationsForTurf = activity?.locations.map(
    ({ coords: { longitude, latitude } }: { coords: { longitude: number; latitude: number } }) => [latitude, longitude],
  );
  const line = lineString(modifiedLocationsForTurf);
  const [minLat, minLng, maxLat, maxLng] = bbox(line);
  console.log([minLat, minLng, maxLat, maxLng]);

  return (
    <>
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <MapView style={{ flex: 1 }}>
          <Camera
            centerCoordinate={[minLat, maxLng]}
            zoomLevel={10}
            animationMode="linearTo"
            animationDuration={800}
            bounds={{ ne: [minLng, minLat], sw: [maxLng, maxLat] }}
            padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
          />
          {activity?.locations?.length > 1 && <MapRouteLine locations={activity.locations} />}
          {activity?.kilometresSplit?.length > 0 && <MapKmSplit kilometresSplit={activity.kilometresSplit} />}
        </MapView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
