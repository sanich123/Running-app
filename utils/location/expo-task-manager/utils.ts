import { getActivitySettings } from '@R/slices/activity-settings/types';
import { recordLocationSample, setTooMuchSpeedDetails } from '@R/slices/location/location';
import { store } from '@R/store';
import { getCurrentActivityDuration } from '@U/activity-duration';
import { speakActivityReminder, speakCompletedKilometer } from '@U/speech/activity-voice';
import { getMaxTrackingSpeedForSport, getSpeedInKmPerHour, getSpeedInMinsInKm } from '../activity-metrics';
import {
  getDistance,
  getElevationChangeBetweenLocations,
  getElevationGainBetweenLocations,
  getKilometerSplitCalculation,
} from '../location-geometry';
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
  const { lastPosition, locationsWithPauses } = store.getState().location;
  const lastArrayLength = locationsWithPauses[locationsWithPauses.length - 1]?.length;
  const firstArrayLength = locationsWithPauses[0]?.length;
  const previousPosition =
    lastPosition ??
    (locationsWithPauses[0]?.length > 0
      ? (locationsWithPauses[locationsWithPauses.length - 1]?.[Math.max(0, (lastArrayLength ?? 1) - 1)] ?? null)
      : null);
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
  const locationState = store.getState().location;
  const {
    duration: totalMovingDuration,
    kilometresSplit: completedKilometres,
    lastKilometer,
    lastKilometerDuration,
    lastKilometerAltitude,
  } = locationState;
  const { language } = store.getState().settings;
  const {
    activityVoiceEnabled,
    activityVoiceMetrics,
    activityVoiceIdentifier,
    activityReminderEnabled,
    activityReminders,
  } = getActivitySettings(store.getState().activitySettings);
  const speedInKmPerHour = getSpeedInKmPerHour(currentDistance, currentDuration);
  const maxSpeedInKmPerHour = getMaxTrackingSpeedForSport(sport);

  if (speedInKmPerHour > maxSpeedInKmPerHour) {
    store.dispatch(setTooMuchSpeedDetails({ speed: speedInKmPerHour, timestamp: currentPosition.timestamp }));
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

  for (const [index, split] of kilometerSplitCalculation.splits.entries()) {
    const splitPoint = split.kilometerPoint;
    if (splitPoint) {
      const splitTimestamp = splitPoint.timestamp;
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
    }
  }
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
    recordLocationSample({
      currentPosition,
      currentDistance,
      currentAltitude,
      currentPace,
      synchronizedDuration,
      syncedAt: Date.now(),
      kilometreSplits: kilometerSplitCalculation.splits,
      remainingKilometreDistance: kilometerSplitCalculation.remainingDistance,
      remainingKilometreDuration: kilometerSplitCalculation.remainingDuration,
      remainingKilometreAltitude: kilometerSplitCalculation.remainingAltitude,
    }),
  );
  return true;
}
