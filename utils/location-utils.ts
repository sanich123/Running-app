import * as turf from '@turf/turf';
import { LocationObject } from 'expo-location';

export function getDistance(origin: LocationObject, destination: LocationObject) {
  const from = turf.point([origin.coords.longitude, origin.coords.latitude]);
  const to = turf.point([destination.coords.longitude, destination.coords.latitude]);
  return turf.distance(from, to, { units: 'meters' });
}

export function getDistanceFromMocks(origin: LocationObject, destination: LocationObject) {
  const from = turf.point([origin.coords.longitude, origin.coords.latitude]);
  const to = turf.point([destination.coords.longitude, destination.coords.latitude]);
  return turf.distance(from, to, { units: 'meters' });
}
