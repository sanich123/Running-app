import polyline from '@mapbox/polyline';
import getDistanceInMeters from '@turf/distance';
import point from 'turf-point';
import { POWERHOURS_COLORS } from '@const/theme-colors';
import type { LocationObject } from 'expo-location';

interface StaticMapFeature {
  type: 'Feature';
  properties: Record<string, string | number>;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
};

function createHaloMarker(
  longitude: number,
  latitude: number,
  color: string,
  radius: number,
  fillOpacity: number,
  strokeWidth: number,
): StaticMapFeature {
  const longitudeScale = 1 / Math.cos((latitude * Math.PI) / 180);

  const createCircle = (radius: number) =>
    Array.from({ length: 25 }, (_, index) => {
      const angle = (index / 24) * Math.PI * 2;
      return [
        longitude + Math.cos(angle) * radius * longitudeScale,
        latitude + Math.sin(angle) * radius,
      ];
    });

  return {
    type: 'Feature',
    properties: {
      fill: color,
      'fill-opacity': fillOpacity,
      stroke: '#FFFFFF',
      'stroke-width': strokeWidth,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [createCircle(radius)],
    },
  };
}

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

export function getMapBoxImage(locations: LocationObject[]) {
  if (locations.length) {
    const polylineLatLang = locations.map(({ coords }) => [coords.latitude, coords.longitude]);
    const encodedPolyline = polyline.encode(polylineLatLang);

    const initialCoordinate = [locations[0].coords.longitude, locations[0].coords.latitude];
    const lastCoordinate = [
      locations[locations.length - 1].coords.longitude,
      locations[locations.length - 1].coords.latitude,
    ];
    const lineOpacity = 0.8;
    const lineWidth = 2;
    const startMarkerColor = POWERHOURS_COLORS.success;
    const finishMarkerColor = POWERHOURS_COLORS.orange;
    const lineColor = finishMarkerColor.replace('#', '');
    const outerRadius = 0.000047;
    const innerRadius = 0.000023;
    const markerGeoJson = {
      type: 'FeatureCollection',
      features: [
        createHaloMarker(initialCoordinate[0], initialCoordinate[1], startMarkerColor, outerRadius, 0.25, 0),
        createHaloMarker(initialCoordinate[0], initialCoordinate[1], startMarkerColor, innerRadius, 1, 1),
        createHaloMarker(lastCoordinate[0], lastCoordinate[1], finishMarkerColor, outerRadius, 0.25, 0),
        createHaloMarker(lastCoordinate[0], lastCoordinate[1], finishMarkerColor, innerRadius, 1, 1),
      ],
    };
    const encodedMarkers = encodeURIComponent(JSON.stringify(markerGeoJson));
    const width = 350;
    const height = 200;
    const doublePixels = '@2x';
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/path-${lineWidth}+${lineColor}-${lineOpacity}(${encodeURIComponent(
      encodedPolyline,
    )}),geojson(${encodedMarkers})/auto/${width}x${height}${doublePixels}?access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}`;
  } else {
    return '';
  }
}

export function getReducedLocations(locations: LocationObject[]) {
  if (locations.length > 2000) {
    const reducerCoefficient = Math.floor(locations.length / 1000);
    return locations.filter((_, i) => i % reducerCoefficient === 0);
  }
  return locations;
}
