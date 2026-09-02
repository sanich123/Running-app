import polyline from '@mapbox/polyline';
import getDistanceInMeters from '@turf/distance';
import point from 'turf-point';
import { POWERHOURS_COLORS } from '@const/theme-colors';
import { MAX_ACTIVITY_LOCATIONS } from './const';
import type { ActivityKilometreSplit, ActivityLocation } from '@S/card/types';
import type { LocationObject } from 'expo-location';

/**
 * Upper bounds for the four sports available on the tracking screen.
 * They intentionally leave room for a realistic sprint/descent, while
 * filtering the most common GPS jumps.
 */
const MAX_TRACKING_SPEED_KMH = {
  walk: 15,
  run: 30,
  bike: 60,
  hike: 20,
} as const;

const DEFAULT_MAX_TRACKING_SPEED_KMH = MAX_TRACKING_SPEED_KMH.run;

/** Mapbox Static Images rejects URLs above roughly 8 KB. Leave headroom for tokens and encoding. */
const MAX_STATIC_MAP_URL_LENGTH = 7600;
const MAX_STATIC_MAP_LOCATIONS = 500;
const STATIC_MAP_IMAGE_SIZE = 360;
const METERS_IN_KILOMETER = 1000;
// GPS altitude is considerably noisier than horizontal position. Keep only
// reasonably confident fixes and require a sustained climb before counting it.
const MIN_ELEVATION_DELTA_METERS = 10;
const MAX_ALTITUDE_ACCURACY_METERS = 15;
const MAX_VERTICAL_SPEED_METERS_PER_SECOND = 3;
const ELEVATION_SMOOTHING_WINDOW = 5;

interface KilometerSplitCalculation {
  splits: ActivityKilometreSplit[];
  remainingDistance: number;
  remainingDuration: number;
  remainingAltitude: number;
}

function getReliableAltitude(location: ActivityLocation) {
  const altitude = location.coords.altitude;
  const altitudeAccuracy = location.coords.altitudeAccuracy;

  if (typeof altitude !== 'number' || !Number.isFinite(altitude)) {
    return null;
  }

  if (
    typeof altitudeAccuracy === 'number' &&
    Number.isFinite(altitudeAccuracy) &&
    (altitudeAccuracy < 0 || altitudeAccuracy > MAX_ALTITUDE_ACCURACY_METERS)
  ) {
    return null;
  }

  if (location.mocked === true || location.coords.mocked === true) {
    return null;
  }

  return altitude;
}

function isPlausibleVerticalChange(previous: ActivityLocation, current: ActivityLocation, elevationDelta: number) {
  const previousTimestamp = previous.timestamp ?? previous.coords.timestamp;
  const currentTimestamp = current.timestamp ?? current.coords.timestamp;
  const elapsedSeconds =
    typeof previousTimestamp === 'number' && typeof currentTimestamp === 'number'
      ? (currentTimestamp - previousTimestamp) / 1000
      : null;

  return (
    elapsedSeconds === null ||
    elapsedSeconds <= 0 ||
    Math.abs(elevationDelta) <= elapsedSeconds * MAX_VERTICAL_SPEED_METERS_PER_SECOND
  );
}

export function getElevationGainBetweenLocations(previous: ActivityLocation, current: ActivityLocation) {
  const elevationChange = getElevationChangeBetweenLocations(previous, current);
  return elevationChange > MIN_ELEVATION_DELTA_METERS ? elevationChange : 0;
}

export function getElevationChangeBetweenLocations(previous: ActivityLocation, current: ActivityLocation) {
  const previousAltitude = getReliableAltitude(previous);
  const currentAltitude = getReliableAltitude(current);

  if (previousAltitude === null || currentAltitude === null) {
    return 0;
  }

  const elevationDelta = currentAltitude - previousAltitude;
  return isPlausibleVerticalChange(previous, current, elevationDelta) ? elevationDelta : 0;
}

function getSmoothedLocations(locations: ActivityLocation[]) {
  const reliableLocations = locations.filter((location) => getReliableAltitude(location) !== null);
  if (reliableLocations.length < 2) return [];

  const halfWindow = Math.floor(ELEVATION_SMOOTHING_WINDOW / 2);
  return reliableLocations.map((location, index) => {
    const window = reliableLocations
      .slice(Math.max(0, index - halfWindow), Math.min(reliableLocations.length, index + halfWindow + 1))
      .map((item) => getReliableAltitude(item) as number)
      .sort((first, second) => first - second);
    const median = window[Math.floor(window.length / 2)];
    return { ...location, coords: { ...location.coords, altitude: median } };
  });
}

function addElevationChangeToKilometres(
  elevationChangeByKilometre: (number | null)[],
  startDistance: number,
  segmentDistance: number,
  elevationChange: number,
) {
  if (!elevationChangeByKilometre.length || segmentDistance <= 0 || !Number.isFinite(elevationChange)) {
    return;
  }

  const segmentEnd = startDistance + segmentDistance;
  let processedDistance = startDistance;

  while (processedDistance < segmentEnd) {
    const kilometreIndex = Math.floor(processedDistance / METERS_IN_KILOMETER);
    const kilometreEnd = (kilometreIndex + 1) * METERS_IN_KILOMETER;
    const distanceInKilometre = Math.min(segmentEnd, kilometreEnd) - processedDistance;

    if (kilometreIndex >= elevationChangeByKilometre.length) {
      break;
    }

    elevationChangeByKilometre[kilometreIndex] =
      (elevationChangeByKilometre[kilometreIndex] ?? 0) + elevationChange * (distanceInKilometre / segmentDistance);
    processedDistance += distanceInKilometre;
  }
}

function getElevationGainCalculation(locations: ActivityLocation[], kilometreCount = 0) {
  const smoothedLocations = getSmoothedLocations(locations);
  const elevationChangeByKilometre = Array.from(
    { length: Math.max(0, Math.floor(kilometreCount)) },
    () => null as number | null,
  );
  if (smoothedLocations.length < 2) {
    return { elevationGain: 0, elevationChangeByKilometre };
  }

  const distances = [0];
  for (let index = 1; index < smoothedLocations.length; index += 1) {
    distances.push(distances[index - 1] + getDistance(smoothedLocations[index - 1], smoothedLocations[index]));
  }
  if (elevationChangeByKilometre.length) {
    elevationChangeByKilometre.fill(0);
    for (let index = 1; index < smoothedLocations.length; index += 1) {
      const previous = smoothedLocations[index - 1];
      const current = smoothedLocations[index];
      const previousAltitude = getReliableAltitude(previous) as number;
      const currentAltitude = getReliableAltitude(current) as number;
      const elevationChange = currentAltitude - previousAltitude;

      if (!isPlausibleVerticalChange(previous, current, elevationChange)) {
        continue;
      }

      addElevationChangeToKilometres(
        elevationChangeByKilometre,
        distances[index - 1],
        distances[index] - distances[index - 1],
        elevationChange,
      );
    }
  }

  let elevationGain = 0;
  let climbStart = getReliableAltitude(smoothedLocations[0]) as number;
  let peak = climbStart;

  const addClimb = (climb: number, isPlausible: boolean) => {
    if (climb < MIN_ELEVATION_DELTA_METERS || !isPlausible) {
      return;
    }

    elevationGain += climb;
  };

  for (let index = 1; index < smoothedLocations.length; index += 1) {
    const current = smoothedLocations[index];
    const currentAltitude = getReliableAltitude(current) as number;
    if (currentAltitude >= peak) {
      peak = currentAltitude;
      continue;
    }

    const descentFromPeak = peak - currentAltitude;
    if (descentFromPeak > 3) {
      const climb = peak - climbStart;
      addClimb(
        climb,
        isPlausibleVerticalChange(
          smoothedLocations[index - 1],
          current,
          currentAltitude - (getReliableAltitude(smoothedLocations[index - 1]) as number),
        ),
      );
      climbStart = currentAltitude;
      peak = currentAltitude;
    }
  }

  const finalClimb = peak - climbStart;
  addClimb(finalClimb, true);
  return { elevationGain, elevationChangeByKilometre };
}

export function getElevationGain(locations: ActivityLocation[]) {
  return getElevationGainCalculation(locations).elevationGain;
}

/**
 * Calculates the accumulated signed elevation change and assigns it to
 * completed kilometres by the location where each change was recorded.
 * Null means that there were not enough reliable altitude samples to recalculate.
 */
export function getElevationGainByKilometres(locations: ActivityLocation[], kilometreCount: number) {
  return getElevationGainCalculation(locations, kilometreCount).elevationChangeByKilometre;
}

function interpolateLocation(start: LocationObject | null, end: LocationObject, fraction: number) {
  if (!start) {
    return end;
  }

  const clampedFraction = Math.min(1, Math.max(0, fraction));
  const interpolate = (startValue: number, endValue: number) => startValue + (endValue - startValue) * clampedFraction;
  const startAltitude = start.coords.altitude;
  const endAltitude = end.coords.altitude;

  return {
    ...end,
    timestamp: interpolate(start.timestamp, end.timestamp),
    coords: {
      ...end.coords,
      latitude: interpolate(start.coords.latitude, end.coords.latitude),
      longitude: interpolate(start.coords.longitude, end.coords.longitude),
      altitude:
        typeof startAltitude === 'number' && typeof endAltitude === 'number'
          ? interpolate(startAltitude, endAltitude)
          : endAltitude,
    },
  };
}

/**
 * Splits one GPS segment at every crossed kilometre. A GPS update can cover
 * more than one kilometre, so the split point is interpolated along the
 * segment instead of being placed at the last received location.
 */
export function getKilometerSplitCalculation({
  previousPosition,
  currentPosition,
  distance,
  duration,
  altitude,
  previousKilometerDistance,
  previousKilometerDuration,
  previousKilometerAltitude,
}: {
  previousPosition: LocationObject | null;
  currentPosition: LocationObject;
  distance: number;
  duration: number;
  altitude: number;
  previousKilometerDistance: number;
  previousKilometerDuration: number;
  previousKilometerAltitude: number;
}): KilometerSplitCalculation {
  const segmentDistance = Math.max(0, distance);
  const segmentDuration = Math.max(0, duration);
  const segmentAltitude = Number.isFinite(altitude) ? altitude : 0;
  const splits: ActivityKilometreSplit[] = [];

  let distanceInCurrentKilometer = Math.max(0, previousKilometerDistance);
  let durationInCurrentKilometer = Math.max(0, previousKilometerDuration);
  let altitudeInCurrentKilometer = Number.isFinite(previousKilometerAltitude) ? previousKilometerAltitude : 0;
  let processedDistance = 0;
  let processedDuration = 0;
  let processedAltitude = 0;

  while (distanceInCurrentKilometer + segmentDistance - processedDistance >= METERS_IN_KILOMETER) {
    const distanceToSplit = METERS_IN_KILOMETER - distanceInCurrentKilometer;
    const splitDistance = processedDistance + distanceToSplit;
    const fraction = segmentDistance > 0 ? splitDistance / segmentDistance : 0;
    const splitDuration = segmentDuration * fraction;
    const splitAltitude = segmentAltitude * fraction;

    splits.push({
      lastKilometerDuration: durationInCurrentKilometer + splitDuration - processedDuration,
      lastKilometerAltitude: altitudeInCurrentKilometer + splitAltitude - processedAltitude,
      kilometerPoint: interpolateLocation(previousPosition, currentPosition, fraction),
    });

    processedDistance = splitDistance;
    processedDuration = splitDuration;
    processedAltitude = splitAltitude;
    distanceInCurrentKilometer = 0;
    durationInCurrentKilometer = 0;
    altitudeInCurrentKilometer = 0;
  }

  return {
    splits,
    remainingDistance: distanceInCurrentKilometer + segmentDistance - processedDistance,
    remainingDuration: durationInCurrentKilometer + segmentDuration - processedDuration,
    remainingAltitude: altitudeInCurrentKilometer + segmentAltitude - processedAltitude,
  };
}

export function getDistance(origin: ActivityLocation, destination: ActivityLocation) {
  const from = point([origin.coords.longitude, origin.coords.latitude]);
  const to = point([destination.coords.longitude, destination.coords.latitude]);
  return getDistanceInMeters(from, to, { units: 'meters' });
}

export function getSpeedInMinsInKm(distance: number, time: number) {
  let paceAsString, paceAsNumber;
  if (distance && time) {
    const millisecondsInSecond = 1000;
    const metersInKilometer = 1000;
    const totalSeconds = time / millisecondsInSecond;
    const totalKilometres = distance / metersInKilometer;
    const paceInSecs = totalSeconds / totalKilometres;
    const wholeMinutes = Math.trunc(paceInSecs / 60);
    const restSeconds = Math.round(paceInSecs - wholeMinutes * 60);
    const modifiedSeconds = restSeconds < 10 ? `0${restSeconds}` : `${restSeconds}`;
    paceAsString = `${wholeMinutes}.${modifiedSeconds}`;
    paceAsNumber = Number(paceAsString);
  } else {
    paceAsString = '0.00';
    paceAsNumber = 0;
  }
  return { paceAsNumber, paceAsString };
}

export function getSpeedInKmPerHour(distance: number, time: number) {
  if (!distance || !time || time <= 0) {
    return 0;
  }

  return distance / 1000 / (time / 3_600_000);
}

export function getAverageCadence(steps: number | null | undefined, duration: number) {
  if (!steps || !duration || duration <= 0) return 0;
  return Math.round((steps * 60_000) / duration);
}

export function isWalkingActivity(sport: string) {
  return sport.toLowerCase() === 'walk' || sport.toLowerCase() === 'walking';
}

export function isHikingActivity(sport: string) {
  const normalizedSport = sport.toLowerCase();
  return normalizedSport === 'hike' || normalizedSport === 'hiking';
}

export function isWalkingOrHikingActivity(sport: string) {
  return isWalkingActivity(sport) || isHikingActivity(sport);
}

export function isCyclingActivity(sport: string) {
  const normalizedSport = sport.toLowerCase();
  return normalizedSport === 'bike' || normalizedSport === 'ride' || normalizedSport === 'cycling';
}

export function isRunningActivity(sport: string) {
  const normalizedSport = sport.toLowerCase();
  return normalizedSport === 'run' || normalizedSport === 'running';
}

export function getMaxTrackingSpeedForSport(sport: string) {
  return MAX_TRACKING_SPEED_KMH[sport as keyof typeof MAX_TRACKING_SPEED_KMH] ?? DEFAULT_MAX_TRACKING_SPEED_KMH;
}

interface StaticMapImageSize {
  width: number;
  height: number;
}

export function getMapBoxImage(
  locations: ActivityLocation[],
  size: StaticMapImageSize = { width: STATIC_MAP_IMAGE_SIZE, height: STATIC_MAP_IMAGE_SIZE },
) {
  const validLocations = locations.filter(
    ({ coords }) => Number.isFinite(coords?.longitude) && Number.isFinite(coords?.latitude),
  );

  if (validLocations.length) {
    const buildUrl = (routeLocations: ActivityLocation[]) => {
      const polylineLatLang = routeLocations.map(({ coords }) => [coords.latitude, coords.longitude]);
      const encodedPolyline = polyline.encode(polylineLatLang);

      const initialCoordinate = [routeLocations[0].coords.longitude, routeLocations[0].coords.latitude];
      const lastCoordinate = [
        routeLocations[routeLocations.length - 1].coords.longitude,
        routeLocations[routeLocations.length - 1].coords.latitude,
      ];
      const lineOpacity = 0.8;
      const lineWidth = 2;
      const startMarkerColor = POWERHOURS_COLORS.success.replace('#', '');
      const finishMarkerColor = POWERHOURS_COLORS.orange.replace('#', '');
      const lineColor = finishMarkerColor;
      const routeOverlay =
        routeLocations.length > 1
          ? `path-${lineWidth}+${lineColor}-${lineOpacity}(${encodeURIComponent(encodedPolyline)})`
          : '';
      const startMarker = `pin-s+${startMarkerColor}(${initialCoordinate.join(',')})`;
      const finishMarker = `pin-s+${finishMarkerColor}(${lastCoordinate.join(',')})`;
      const width = Math.max(1, Math.round(size.width));
      const height = Math.max(1, Math.round(size.height));
      const doublePixels = '@2x';
      const overlays = [routeOverlay, startMarker, finishMarker].filter(Boolean).join(',');

      return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/auto/${width}x${height}${doublePixels}?access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}`;
    };

    let reducedLocations = getReducedLocations(validLocations, MAX_STATIC_MAP_LOCATIONS);
    let imageUrl = buildUrl(reducedLocations);

    while (imageUrl.length > MAX_STATIC_MAP_URL_LENGTH && reducedLocations.length > 2) {
      const nextLimit = Math.max(2, Math.floor(reducedLocations.length * 0.75));
      const nextLocations = getReducedLocations(reducedLocations, nextLimit);
      if (nextLocations.length >= reducedLocations.length) {
        break;
      }
      reducedLocations = nextLocations;
      imageUrl = buildUrl(reducedLocations);
    }

    return imageUrl;
  } else {
    return '';
  }
}

export function getReducedLocations(locations: LocationObject[], maxLocations?: number): LocationObject[];
export function getReducedLocations(locations: ActivityLocation[], maxLocations?: number): ActivityLocation[];
export function getReducedLocations(locations: ActivityLocation[], maxLocations = MAX_ACTIVITY_LOCATIONS) {
  if (locations.length > maxLocations) {
    return Array.from({ length: maxLocations }, (_, index) => {
      const sourceIndex = Math.round((index * (locations.length - 1)) / (maxLocations - 1));
      return locations[sourceIndex];
    });
  }
  return locations;
}
