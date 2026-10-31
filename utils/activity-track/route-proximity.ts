import type { ActivityLocation } from '@S/card/types';

const EARTH_RADIUS_METERS = 6_371_008.8;
const DEGREES_TO_RADIANS = Math.PI / 180;
export const MAX_CONFIDENT_NAVIGATION_ACCURACY_METERS = 25;
export const NAVIGATION_ALERT_REARM_DISTANCE_METERS = 10;

function getValidCoordinates({ coords }: ActivityLocation) {
  const { latitude, longitude } = coords;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

function getLongitudeDeltaDegrees(longitude: number, referenceLongitude: number) {
  return ((longitude - referenceLongitude + 540) % 360) - 180;
}

export function getDistanceToRouteMeters(position: ActivityLocation, route: ActivityLocation[]) {
  const positionCoordinates = getValidCoordinates(position);
  if (!positionCoordinates || route.length < 2) return null;

  const referenceLatitudeRadians = positionCoordinates.latitude * DEGREES_TO_RADIANS;
  const metersPerLongitudeRadian = EARTH_RADIUS_METERS * Math.cos(referenceLatitudeRadians);
  const project = ({ latitude, longitude }: { latitude: number; longitude: number }) => ({
    x:
      getLongitudeDeltaDegrees(longitude, positionCoordinates.longitude) *
      DEGREES_TO_RADIANS *
      metersPerLongitudeRadian,
    y: (latitude - positionCoordinates.latitude) * DEGREES_TO_RADIANS * EARTH_RADIUS_METERS,
  });

  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 1; index < route.length; index += 1) {
    const previousLocation = route[index - 1];
    const currentLocation = route[index];
    if (!previousLocation || !currentLocation) continue;
    const previousCoordinates = getValidCoordinates(previousLocation);
    const currentCoordinates = getValidCoordinates(currentLocation);
    if (!previousCoordinates || !currentCoordinates) continue;

    const start = project(previousCoordinates);
    const end = project(currentCoordinates);
    const segmentX = end.x - start.x;
    const segmentY = end.y - start.y;
    const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
    const projection =
      segmentLengthSquared === 0
        ? 0
        : Math.max(0, Math.min(1, -(start.x * segmentX + start.y * segmentY) / segmentLengthSquared));
    const distance = Math.hypot(start.x + projection * segmentX, start.y + projection * segmentY);
    nearestDistance = Math.min(nearestDistance, distance);
  }

  return Number.isFinite(nearestDistance) ? nearestDistance : null;
}
