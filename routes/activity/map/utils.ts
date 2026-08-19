import type { Location as MapboxLocation } from '@rnmapbox/maps';
import type { LocationObject } from 'expo-location';

export function distanceInMeters(first: LocationObject, second: MapboxLocation) {
  const earthRadius = 6_371_000;
  const firstLatitude = (first.coords.latitude * Math.PI) / 180;
  const secondLatitude = (second.coords.latitude * Math.PI) / 180;
  const latitudeDelta = secondLatitude - firstLatitude;
  const longitudeDelta = ((second.coords.longitude - first.coords.longitude) * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
