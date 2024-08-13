//@ts-ignore
import polyline from '@mapbox/polyline';
import distance from '@turf/distance';
import { LocationObject } from 'expo-location';

//@ts-ignore
import point from 'turf-point';

export function getDistance(origin: LocationObject, destination: LocationObject) {
  const from = point([origin.coords.longitude, origin.coords.latitude]);
  const to = point([destination.coords.longitude, destination.coords.latitude]);
  return distance(from, to, { units: 'meters' });
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
