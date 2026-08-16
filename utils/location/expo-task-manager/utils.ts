import {
  addDurationAndLocationToKmSplits,
  resetLastKm,
  setAltitude,
  setCurrentPace,
  setDistance,
  setDuration,
  setIsTooMuchSpeed,
  setTooMuchSpeed,
  setTooMuchSpeedTimestamp,
  setLastKm,
  setLastKmAltitude,
  setLastKmDuration,
  setLastPosition,
  setLocationsFromBackground,
  setLocationsWhenContinued,
} from '@R/slices/location/location';
import { store } from '@R/store';
import {
  getDistance,
  getElevationGainBetweenLocations,
  getKilometerSplitCalculation,
  getMaxTrackingSpeedForSport,
  getSpeedInKmPerHour,
  getSpeedInMinsInKm,
} from '../location-utils';
import type { LocationObject } from 'expo-location';

export function getMetricsTaskManager(currentPosition: LocationObject) {
  const { locationsWithPauses } = store.getState().location;
  const lastArrayLength = locationsWithPauses[locationsWithPauses.length - 1]?.length;
  const firstArrayLength = locationsWithPauses[0]?.length;
  const previousPosition =
    locationsWithPauses[0]?.length > 0
      ? locationsWithPauses[locationsWithPauses.length - 1][lastArrayLength - 1]
      : null;
  const currentDuration = previousPosition ? currentPosition.timestamp - previousPosition.timestamp : 0;
  const currentDistance = previousPosition ? getDistance(previousPosition, currentPosition) : 0;
  const currentAltitude = previousPosition ? getElevationGainBetweenLocations(previousPosition, currentPosition) : 0;
  const isExistingDistanceDuration = currentDistance && currentDuration;
  const currentPace = isExistingDistanceDuration
    ? getSpeedInMinsInKm(currentDistance, currentDuration).paceAsNumber
    : 0;
  return {
    previousPosition,
    currentDuration,
    currentDistance,
    currentAltitude,
    currentPace,
    firstArrayLength,
    lastArrayLength,
  };
}

export function saveMetricsToStoreTaskManager(
  currentPosition: LocationObject,
  currentDuration: number,
  currentPace: number,
  currentAltitude: number,
  currentDistance: number,
  previousPosition: LocationObject | null,
) {
  const { sport } = store.getState().additionalInfoActivity;
  const speedInKmPerHour = getSpeedInKmPerHour(currentDistance, currentDuration);
  const maxSpeedInKmPerHour = getMaxTrackingSpeedForSport(sport);

  if (speedInKmPerHour > maxSpeedInKmPerHour) {
    store.dispatch(setIsTooMuchSpeed(true));
    store.dispatch(setTooMuchSpeed(speedInKmPerHour));
    store.dispatch(setTooMuchSpeedTimestamp(currentPosition.timestamp));
    return false;
  }

  const { lastKilometer, lastKilometerDuration, lastKilometerAltitude } = store.getState().location;
  const kilometerSplitCalculation = getKilometerSplitCalculation({
    previousPosition,
    currentPosition,
    distance: currentDistance,
    duration: currentDuration,
    altitude: currentAltitude,
    previousKilometerDistance: lastKilometer,
    previousKilometerDuration: lastKilometerDuration,
    previousKilometerAltitude: lastKilometerAltitude,
  });

  if (kilometerSplitCalculation.splits.length) {
    store.dispatch(resetLastKm());
    for (const split of kilometerSplitCalculation.splits) {
      store.dispatch(setLastKmDuration(split.lastKilometerDuration));
      store.dispatch(setLastKmAltitude(split.lastKilometerAltitude));
      store.dispatch(addDurationAndLocationToKmSplits(split.kilometerPoint));
      store.dispatch(resetLastKm());
    }
  }
  // The calculation already includes the previous remainder. Replace the
  // stored values instead of adding the remainder to the old remainder.
  store.dispatch(resetLastKm());
  store.dispatch(setLastKm(kilometerSplitCalculation.remainingDistance));
  store.dispatch(setLastKmDuration(kilometerSplitCalculation.remainingDuration));
  store.dispatch(setLastKmAltitude(kilometerSplitCalculation.remainingAltitude));
  store.dispatch(setDistance(currentDistance));
  store.dispatch(setDuration(currentDuration));
  store.dispatch(setCurrentPace(currentPace));
  store.dispatch(setAltitude(currentAltitude));
  store.dispatch(setLocationsWhenContinued(currentPosition));
  store.dispatch(setLastPosition(currentPosition));
  store.dispatch(setLocationsFromBackground(currentPosition));
  store.dispatch(setIsTooMuchSpeed(false));
  store.dispatch(setTooMuchSpeed(0));
  store.dispatch(setTooMuchSpeedTimestamp(null));
  return true;
}
