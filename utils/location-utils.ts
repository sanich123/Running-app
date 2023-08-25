import * as turf from '@turf/turf';
import { LocationObject } from 'expo-location';

export function getDistance(origin: LocationObject, destination: LocationObject) {
  const from = turf.point([origin.coords.longitude, origin.coords.latitude]);
  const to = turf.point([destination.coords.longitude, destination.coords.latitude]);
  return turf.distance(from, to, { units: 'meters' });
}

export function getTotalSpeed(distance: number, time: number) {
  return Number((distance / 1000 / (time / 3600)).toFixed(3));
}
export function generateNextLocation(currentLocation) {
  return {
    coords: {
      latitude:
        Math.random() > 0.5 ? currentLocation.coords.latitude + 0.000004 : currentLocation.coords.latitude - 0.000004,
      longitude:
        Math.random() > 0.5 ? currentLocation.coords.longitude + 0.000004 : currentLocation.coords.longitude - 0.000004,
      altitude: currentLocation.coords.altitude,
      accuracy: currentLocation.coords.accuracy,
      altitudeAccuracy: currentLocation.coords.altitudeAccuracy,
      heading: currentLocation.coords.heading,
      speed: currentLocation.coords.speed,
    },
    timestamp: currentLocation.timestamp + 1000,
    mocked: false,
  };
}
