import type { ActivityLocation } from '@S/card/types';

export type RouteCoordinate = [number, number];

export interface RouteTimeline {
  coordinates: RouteCoordinate[];
  cumulativeDistances: number[];
  totalDistance: number;
}

function getDistanceInMeters(from: RouteCoordinate, to: RouteCoordinate) {
  const earthRadius = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to[1] - from[1]);
  const longitudeDelta = toRadians(to[0] - from[0]);
  const fromLatitude = toRadians(from[1]);
  const toLatitude = toRadians(to[1]);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function createRouteTimeline(locations: ActivityLocation[]): RouteTimeline {
  const coordinates = locations.map(({ coords }) => [coords.longitude, coords.latitude] as RouteCoordinate);
  const cumulativeDistances = [0];

  for (let index = 1; index < coordinates.length; index += 1) {
    cumulativeDistances.push(
      cumulativeDistances[index - 1] + getDistanceInMeters(coordinates[index - 1], coordinates[index]),
    );
  }

  return {
    coordinates,
    cumulativeDistances,
    totalDistance: cumulativeDistances.at(-1) ?? 0,
  };
}

export function getRouteCoordinateAtProgress(timeline: RouteTimeline, progress: number): RouteCoordinate | null {
  const { coordinates, cumulativeDistances, totalDistance } = timeline;
  if (!coordinates.length) return null;
  if (coordinates.length === 1 || totalDistance <= 0) return coordinates[0];

  const targetDistance = totalDistance * Math.max(0, Math.min(1, progress));
  let low = 1;
  let high = cumulativeDistances.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (cumulativeDistances[middle] < targetDistance) low = middle + 1;
    else high = middle;
  }

  const segmentStartDistance = cumulativeDistances[low - 1];
  const segmentLength = cumulativeDistances[low] - segmentStartDistance;
  const segmentProgress = segmentLength > 0 ? (targetDistance - segmentStartDistance) / segmentLength : 0;
  const from = coordinates[low - 1];
  const to = coordinates[low];

  return [from[0] + (to[0] - from[0]) * segmentProgress, from[1] + (to[1] - from[1]) * segmentProgress];
}

export function getRouteHeadingAtProgress(timeline: RouteTimeline, progress: number): number {
  const { coordinates, totalDistance } = timeline;
  if (coordinates.length < 2 || totalDistance <= 0) return 0;

  const targetDistance = totalDistance * Math.max(0, Math.min(1, progress));
  const headingStartDistance = Math.min(targetDistance, Math.max(totalDistance - 30, 0));
  const headingEndDistance = Math.min(headingStartDistance + 30, totalDistance);
  const from = getRouteCoordinateAtProgress(timeline, headingStartDistance / totalDistance);
  const to = getRouteCoordinateAtProgress(timeline, headingEndDistance / totalDistance);
  if (!from || !to || (from[0] === to[0] && from[1] === to[1])) return 0;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeFrom = toRadians(from[1]);
  const latitudeTo = toRadians(to[1]);
  const longitudeDelta = toRadians(to[0] - from[0]);
  const y = Math.sin(longitudeDelta) * Math.cos(latitudeTo);
  const x =
    Math.cos(latitudeFrom) * Math.sin(latitudeTo) -
    Math.sin(latitudeFrom) * Math.cos(latitudeTo) * Math.cos(longitudeDelta);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
