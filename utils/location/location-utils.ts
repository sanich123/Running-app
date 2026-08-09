import polyline from '@mapbox/polyline';
import getDistanceInMeters from '@turf/distance';
import point from 'turf-point';
import { POWERHOURS_COLORS } from '@const/theme-colors';
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

export function getDistance(origin: LocationObject, destination: LocationObject) {
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

  return (distance / 1000) / (time / 3_600_000);
}

export function getMaxTrackingSpeedForSport(sport: string) {
  return MAX_TRACKING_SPEED_KMH[sport as keyof typeof MAX_TRACKING_SPEED_KMH] ?? DEFAULT_MAX_TRACKING_SPEED_KMH;
}

export function getMapBoxImage(locations: LocationObject[]) {
  const validLocations = locations.filter(
    ({ coords }) => Number.isFinite(coords?.longitude) && Number.isFinite(coords?.latitude),
  );

  if (validLocations.length) {
    const buildUrl = (routeLocations: LocationObject[]) => {
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
      const width = 350;
      const height = 200;
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

export function getReducedLocations(locations: LocationObject[], maxLocations = 1000) {
  if (locations.length > maxLocations) {
    return Array.from({ length: maxLocations }, (_, index) => {
      const sourceIndex = Math.round((index * (locations.length - 1)) / (maxLocations - 1));
      return locations[sourceIndex];
    });
  }
  return locations;
}
