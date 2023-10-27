import polyline from '@mapbox/polyline';
import * as turf from '@turf/turf';
import { LocationObject } from 'expo-location';

export function getDistance(origin: LocationObject, destination: LocationObject) {
  const from = turf.point([origin.coords.longitude, origin.coords.latitude]);
  const to = turf.point([destination.coords.longitude, destination.coords.latitude]);
  return turf.distance(from, to, { units: 'meters' });
}

export function getSpeedInMinsInKm(distance, time) {
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

export function paceBetween(distance: number, from: LocationObject, to: LocationObject) {
  return Math.round((to.timestamp - from.timestamp) / distance);
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
    const lineColor = 'F66767';
    const width = 900;
    const height = 200;
    const doublePixels = '@2x';
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s-a+9ed4bd(${initialCoordinate[0]},${
      initialCoordinate[1]
    }),pin-s-b+000(${lastCoordinate[0]},${
      lastCoordinate[1]
    }),path-${lineWidth}+${lineColor}-${lineOpacity}(${encodeURIComponent(
      encodedPolyline,
    )})/auto/${width}x${height}${doublePixels}?access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}`;
  }
}
