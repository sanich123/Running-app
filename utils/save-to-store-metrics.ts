import {
  addDurationAndLocationToKmSplits,
  resetLastKm,
  setLastKm,
  setLastKmDuration,
  setCurrentPace,
  setLastKmAltitude,
  setDistance,
  setDuration,
  setAltitude,
  setLocationsWhenContinued,
  setLastPosition,
  setLocationsFromBackground,
  setIsTooMuchSpeed,
} from '@R/location/location';
import { store } from '@R/store';
import { LocationObject } from 'expo-location';

import { getDistance, getSpeedInMinsInKm } from './location-utils';

export function saveMetricsToStore(
  currentKilometer: number,
  currentPosition: LocationObject,
  currentDuration: number,
  currentPace: number,
  currentAltitude: number,
  currentDistance: number,
) {
  if (currentKilometer >= 1000) {
    store.dispatch(addDurationAndLocationToKmSplits(currentPosition));
    store.dispatch(resetLastKm());
  } else {
    store.dispatch(setLastKm(currentDistance));
    store.dispatch(setLastKmDuration(currentDuration));
    store.dispatch(setCurrentPace(currentPace));
    store.dispatch(setLastKmAltitude(currentAltitude));
  }
  store.dispatch(setDistance(currentDistance));
  store.dispatch(setDuration(currentDuration));
  store.dispatch(setCurrentPace(currentPace));
  store.dispatch(setAltitude(currentAltitude));
  store.dispatch(setLocationsWhenContinued(currentPosition));
  store.dispatch(setLastPosition(currentPosition));
  store.dispatch(setLocationsFromBackground(currentPosition));
  store.dispatch(setIsTooMuchSpeed(false));
}

export function getMetrics(currentPosition: LocationObject) {
  const { lastKilometer, locationsWithPauses } = store.getState().location;
  const lastArrayLength = locationsWithPauses[locationsWithPauses.length - 1]?.length;
  const firstArrayLength = locationsWithPauses[0]?.length;
  const previousPosition =
    locationsWithPauses[0]?.length > 0
      ? locationsWithPauses[locationsWithPauses.length - 1][lastArrayLength - 1]
      : null;
  const currentDuration = previousPosition ? currentPosition.timestamp - previousPosition.timestamp : 0;
  const currentDistance = previousPosition ? getDistance(previousPosition, currentPosition) : 0;
  const currentAltitude = previousPosition ? currentPosition.coords.altitude - previousPosition.coords.altitude : 0;
  const isExistingDistanceDuration = currentDistance && currentDuration;
  const currentPace = isExistingDistanceDuration
    ? getSpeedInMinsInKm(currentDistance, currentDuration).paceAsNumber
    : 0;
  const currentKilometer = lastKilometer + currentDistance;

  return {
    currentDuration,
    currentDistance,
    currentAltitude,
    currentPace,
    currentKilometer,
    firstArrayLength,
    lastArrayLength,
  };
}
