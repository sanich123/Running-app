import {
  getDistance,
  getElevationChangeBetweenLocations,
  getKilometerSplitCalculation,
} from '@U/location/location-utils';
import type { LastKmSplit } from '@R/slices/location/types';
import type { ActivityKilometreSplit } from '@S/card/types';
import type { LocationObject } from 'expo-location';

function hasValidCoordinates(location: LocationObject) {
  return Number.isFinite(location.coords.latitude) && Number.isFinite(location.coords.longitude);
}

function getTimestamp(location: LocationObject) {
  const timestamp = location.timestamp;
  return typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

function normalizeSplit(split: ActivityKilometreSplit): LastKmSplit | null {
  const point = split.kilometerPoint;
  if (!point) return null;
  const timestamp = typeof point.timestamp === 'number' && Number.isFinite(point.timestamp) ? point.timestamp : 0;
  return {
    lastKilometerDuration: split.lastKilometerDuration,
    lastKilometerAltitude: split.lastKilometerAltitude,
    ...(split.lastKilometerSteps !== null && split.lastKilometerSteps !== undefined
      ? { lastKilometerSteps: split.lastKilometerSteps }
      : {}),
    kilometerPoint: {
      timestamp,
      ...(point.mocked !== null && point.mocked !== undefined ? { mocked: point.mocked } : {}),
      coords: {
        latitude: point.coords.latitude,
        longitude: point.coords.longitude,
        altitude: point.coords.altitude ?? null,
        accuracy: point.coords.accuracy ?? null,
        altitudeAccuracy: point.coords.altitudeAccuracy ?? null,
        heading: point.coords.heading ?? null,
        speed: point.coords.speed ?? null,
      },
    },
  };
}

/**
 * Calculates completed kilometre splits from a Health Connect route.
 *
 * The route geometry is scaled to the declared Health Connect distance when
 * it is available. This keeps kilometre points aligned with the distance
 * shown for the workout even when the route contains sparse GPS samples.
 */
export function calculateWatchWorkoutKilometreSplits(
  locations: LocationObject[],
  totalDuration: number,
  declaredDistance?: number,
): LastKmSplit[] {
  const validLocations = locations.filter(hasValidCoordinates);
  if (validLocations.length < 2) return [];

  const geometricSegmentDistances = validLocations
    .slice(1)
    .map((location, index) => getDistance(validLocations[index], location));
  const geometricTotalDistance = geometricSegmentDistances.reduce((sum, distance) => sum + distance, 0);
  if (!Number.isFinite(geometricTotalDistance) || geometricTotalDistance <= 0) return [];

  const safeDuration = Number.isFinite(totalDuration) ? Math.max(0, totalDuration) : 0;
  const safeDeclaredDistance =
    typeof declaredDistance === 'number' && Number.isFinite(declaredDistance) && declaredDistance > 0
      ? declaredDistance
      : undefined;
  const distanceScale = safeDeclaredDistance ? safeDeclaredDistance / geometricTotalDistance : 1;
  const segmentDistances = geometricSegmentDistances.map((distance) => distance * distanceScale);
  const totalDistance = segmentDistances.reduce((sum, distance) => sum + distance, 0);
  if (!Number.isFinite(totalDistance) || totalDistance <= 0) return [];

  const firstTimestamp = getTimestamp(validLocations[0]);
  const lastTimestamp = getTimestamp(validLocations.at(-1)!);
  const timestampSpan =
    firstTimestamp !== null && lastTimestamp !== null ? Math.max(0, lastTimestamp - firstTimestamp) : 0;
  const timestampScale = timestampSpan > safeDuration && timestampSpan > 0 ? safeDuration / timestampSpan : 1;

  const splits: ActivityKilometreSplit[] = [];
  let distanceInCurrentKilometer = 0;
  let durationInCurrentKilometer = 0;
  let altitudeInCurrentKilometer = 0;

  segmentDistances.forEach((segmentDistance, index) => {
    const previous = validLocations[index];
    const current = validLocations[index + 1];
    const previousTimestamp = getTimestamp(previous);
    const currentTimestamp = getTimestamp(current);
    const timestampDuration =
      previousTimestamp !== null && currentTimestamp !== null
        ? Math.max(0, currentTimestamp - previousTimestamp) * timestampScale
        : 0;
    const proportionalDuration = (safeDuration * segmentDistance) / totalDistance;
    const segmentDuration = timestampDuration || proportionalDuration;
    const elevationChange = getElevationChangeBetweenLocations(previous, current);
    const calculation = getKilometerSplitCalculation({
      previousPosition: previous,
      currentPosition: current,
      distance: segmentDistance,
      duration: segmentDuration,
      altitude: elevationChange,
      previousKilometerDistance: distanceInCurrentKilometer,
      previousKilometerDuration: durationInCurrentKilometer,
      previousKilometerAltitude: altitudeInCurrentKilometer,
    });

    splits.push(...calculation.splits);
    distanceInCurrentKilometer = calculation.remainingDistance;
    durationInCurrentKilometer = calculation.remainingDuration;
    altitudeInCurrentKilometer = calculation.remainingAltitude;
  });

  return splits.flatMap((split) => {
    const normalizedSplit = normalizeSplit(split);
    return normalizedSplit ? [normalizedSplit] : [];
  });
}
