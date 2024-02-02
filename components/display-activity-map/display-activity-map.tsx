import ErrorComponent from '@C/error-component/error-component';
// import { LastKmSplit } from '@R/location/types';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { MapView, Camera } from '@rnmapbox/maps';
import bbox from '@turf/bbox';
// import { LocationObject } from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
//@ts-ignore
import lineString from 'turf-linestring';

import MapKmSplit from '../map-km-split/map-km-split';
import RouteLine from '../map-route-line/map-route-line';

// type DisplayActivityMapProps = {
//   locations: LocationObject[];
//   kilometresSplit: LastKmSplit[];
// };

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
    <MapView style={[{ flex: 1 }, (isLoading || error) && styles.isInCenter]}>
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <Camera
          animationMode="flyTo"
          animationDuration={1000}
          bounds={{ ne: [minLng, minLat], sw: [maxLng, maxLat] }}
          // padding={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, paddingTop: 20 }}
        />
      )}
      {activity?.locations?.length > 1 && <RouteLine locations={activity.locations} />}
      {activity?.kilometresSplit?.length > 0 && <MapKmSplit kilometresSplit={activity.kilometresSplit} />}
    </MapView>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
