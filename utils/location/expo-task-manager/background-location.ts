import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { setLocationProvider } from '@R/slices/location/location';
import { setTrackingRecoveryProgress } from '@R/slices/tracking-recovery/tracking-recovery';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import {
  appendLocationToJournal,
  getLocationJournalProgress,
  getActiveLocationJournalId,
} from '@U/location/location-journal';
import { getMetricsTaskManager, saveMetricsToStoreTaskManager } from './utils';
import { BACKGROUND_NOTIFICATION, DISTANCE_INTERVAL, LOCATION_TRACKING, TIME_INTERVAL } from '../const';
import type { TaskManagerLocationEvent } from '../const';
import type { LocationObject } from 'expo-location';

let isTrackingActive = false;

function isMissingLocationTaskError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('TaskNotFoundException') || message.includes(`Task '${LOCATION_TRACKING}' not found`);
}

function processLocation(currentPosition: LocationObject) {
  if (!isTrackingActive) {
    return false;
  }

  const lastPosition = store.getState().location.lastPosition;
  if (lastPosition && currentPosition.timestamp <= lastPosition.timestamp) {
    return false;
  }

  try {
    const { previousPosition, currentDuration, currentDistance, currentAltitude, currentPace } =
      getMetricsTaskManager(currentPosition);

    const didSave = saveMetricsToStoreTaskManager(
      currentPosition,
      currentDuration,
      currentPace,
      currentAltitude,
      currentDistance,
      previousPosition,
    );
    if (!didSave) return false;
    const journalId = getActiveLocationJournalId();
    if (!journalId || !appendLocationToJournal(journalId, currentPosition)) return false;
    const progress = getLocationJournalProgress(journalId);
    if (progress) {
      const locationState = store.getState().location;
      store.dispatch(
        setTrackingRecoveryProgress({
          ...progress,
          metrics: {
            initialLocation: locationState.initialLocation,
            lastPosition: locationState.lastPosition,
            distance: locationState.distance,
            steps: locationState.steps,
            duration: locationState.duration,
            durationAtLastLocation: locationState.durationAtLastLocation,
            durationTimerBase: locationState.durationTimerBase,
            durationTimerStartedAt: locationState.durationTimerStartedAt,
            recordingStartedAt: locationState.recordingStartedAt,
            recordingTimeZone: locationState.recordingTimeZone,
            altitude: locationState.altitude,
            lastKilometerAltitude: locationState.lastKilometerAltitude,
            lastKilometer: locationState.lastKilometer,
            lastKilometerDuration: locationState.lastKilometerDuration,
            currentPace: locationState.currentPace,
            kilometresSplit: locationState.kilometresSplit,
          },
        }),
      );
    }
    return true;
  } catch (error) {
    if (__DEV__) console.error('[tracking]', 'Something went wrong when saving a new location...', error);
    return false;
  }
}

export async function startLocationTracking() {
  let didStartBackgroundTask = false;
  isTrackingActive = true;

  try {
    if (!(await hasStartedLocationUpdatesAsync(LOCATION_TRACKING))) {
      await startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Accuracy.BestForNavigation,
        timeInterval: TIME_INTERVAL,
        distanceInterval: DISTANCE_INTERVAL,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: BACKGROUND_NOTIFICATION[store.getState().settings.language].isActive,
          notificationBody: BACKGROUND_NOTIFICATION[store.getState().settings.language].turnOff,
          notificationColor: '#333333',
        },
      });
      didStartBackgroundTask = true;
    }
  } catch (error) {
    isTrackingActive = false;

    if (didStartBackgroundTask) {
      try {
        await stopLocationUpdatesAsync(LOCATION_TRACKING);
      } catch {
        // Keep the original error: it is the one the caller can act on.
      }
    }

    throw error;
  }
}

export async function stopLocationTracking() {
  let stopError: unknown;
  isTrackingActive = false;

  try {
    if (await hasStartedLocationUpdatesAsync(LOCATION_TRACKING)) {
      await stopLocationUpdatesAsync(LOCATION_TRACKING);
    }
  } catch (error) {
    // The task can disappear after an app restart or while Android is
    // delivering a background event. Stopping it is still considered done.
    if (!isMissingLocationTaskError(error)) {
      stopError = error;
    }
  }

  if (stopError) {
    throw stopError;
  }
}

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }: TaskManagerLocationEvent) => {
  if (error) {
    errorToast('Ошибка фонового отслеживания геопозиции', error);
    return;
  }

  if (!data?.locations?.length) {
    return;
  }

  for (const currentPosition of data.locations) {
    const { provider, ...position } = currentPosition;
    if (provider) {
      store.dispatch(setLocationProvider(provider));
    }
    processLocation(position);
  }
});
