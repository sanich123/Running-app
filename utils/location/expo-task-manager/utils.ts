import {
  addDurationAndLocationToKmSplits,
  resetLastKm,
  setAltitude,
  setCurrentPace,
  setDistance,
  syncDurationFromLocation,
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
import { getActivitySettings } from '@R/slices/settings/types';
import { store } from '@R/store';
import { getCurrentActivityDuration } from '@U/activity-duration';
import { speakActivityReminder, speakCompletedKilometer } from '@U/speech/activity-voice';
import {
  getDistance,
  getElevationChangeBetweenLocations,
  getElevationGainBetweenLocations,
  getKilometerSplitCalculation,
  getMaxTrackingSpeedForSport,
  getSpeedInKmPerHour,
  getSpeedInMinsInKm,
} from '../location-utils';
import type { LocationObject } from 'expo-location';

export function getCompletedReminderCount(
  previousMovingDuration: number,
  currentMovingDuration: number,
  intervalMinutes: number,
) {
  const intervalMilliseconds = intervalMinutes * 60_000;
  if (
    !Number.isFinite(previousMovingDuration) ||
    !Number.isFinite(currentMovingDuration) ||
    !Number.isFinite(intervalMilliseconds) ||
    intervalMilliseconds <= 0 ||
    currentMovingDuration <= previousMovingDuration
  ) {
    return 0;
  }

  return (
    Math.floor(currentMovingDuration / intervalMilliseconds) - Math.floor(previousMovingDuration / intervalMilliseconds)
  );
}

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
  const { sport } = store.getState().activity;
  const { duration: totalMovingDuration, kilometresSplit: completedKilometres } = store.getState().location;
  const { language } = store.getState().settings;
  const {
    activityVoiceEnabled,
    activityVoiceMetrics,
    activityVoiceIdentifier,
    activityReminderEnabled,
    activityReminders,
  } = getActivitySettings(store.getState().settings);
  const speedInKmPerHour = getSpeedInKmPerHour(currentDistance, currentDuration);
  const maxSpeedInKmPerHour = getMaxTrackingSpeedForSport(sport);

  if (speedInKmPerHour > maxSpeedInKmPerHour) {
    store.dispatch(setIsTooMuchSpeed(true));
    store.dispatch(setTooMuchSpeed(speedInKmPerHour));
    store.dispatch(setTooMuchSpeedTimestamp(currentPosition.timestamp));
    return false;
  }

  if (activityReminderEnabled) {
    for (const reminder of activityReminders) {
      const reminderCount = getCompletedReminderCount(
        totalMovingDuration,
        totalMovingDuration + currentDuration,
        reminder.intervalMinutes,
      );
      for (let index = 0; index < reminderCount; index += 1) {
        speakActivityReminder(reminder.text, language, activityVoiceIdentifier);
      }
    }
  }

  const { lastKilometer, lastKilometerDuration, lastKilometerAltitude } = store.getState().location;
  const elevationChange = previousPosition ? getElevationChangeBetweenLocations(previousPosition, currentPosition) : 0;
  const currentElevationChange = elevationChange || currentAltitude;
  const kilometerSplitCalculation = getKilometerSplitCalculation({
    previousPosition,
    currentPosition,
    distance: currentDistance,
    duration: currentDuration,
    altitude: currentElevationChange,
    previousKilometerDistance: lastKilometer,
    previousKilometerDuration: lastKilometerDuration,
    previousKilometerAltitude: lastKilometerAltitude,
  });

  if (kilometerSplitCalculation.splits.length) {
    store.dispatch(resetLastKm());
    for (const [index, split] of kilometerSplitCalculation.splits.entries()) {
      store.dispatch(setLastKmDuration(split.lastKilometerDuration));
      store.dispatch(setLastKmAltitude(split.lastKilometerAltitude));
      store.dispatch(addDurationAndLocationToKmSplits(split.kilometerPoint));
      const splitTimestamp = split.kilometerPoint.timestamp;
      const previousTimestamp = previousPosition?.timestamp;
      const durationFromSegmentStart =
        typeof splitTimestamp === 'number' && typeof previousTimestamp === 'number'
          ? Math.max(0, splitTimestamp - previousTimestamp)
          : 0;
      speakCompletedKilometer(
        {
          kilometer: completedKilometres.length + index + 1,
          paceDuration: split.lastKilometerDuration,
          movingDuration: totalMovingDuration + durationFromSegmentStart,
          elevationGain: split.lastKilometerAltitude,
          language,
        },
        { activityVoiceEnabled, activityVoiceMetrics, activityVoiceIdentifier },
      );
      store.dispatch(resetLastKm());
    }
  }
  // The calculation already includes the previous remainder. Replace the
  // stored values instead of adding the remainder to the old remainder.
  store.dispatch(resetLastKm());
  store.dispatch(setLastKm(kilometerSplitCalculation.remainingDistance));
  store.dispatch(setLastKmDuration(kilometerSplitCalculation.remainingDuration));
  store.dispatch(setLastKmAltitude(kilometerSplitCalculation.remainingAltitude));
  const locationState = store.getState().location;
  const normalizedCurrentDuration = Number.isFinite(currentDuration) ? Math.max(0, currentDuration) : 0;
  const durationAtLastLocation = Number.isFinite(locationState.durationAtLastLocation)
    ? locationState.durationAtLastLocation
    : Number.isFinite(locationState.duration)
      ? locationState.duration
      : 0;
  const synchronizedDuration = previousPosition
    ? durationAtLastLocation + normalizedCurrentDuration
    : getCurrentActivityDuration(locationState);
  store.dispatch(
    syncDurationFromLocation({
      duration: synchronizedDuration,
      syncedAt: Date.now(),
    }),
  );
  store.dispatch(setDistance(currentDistance));
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
