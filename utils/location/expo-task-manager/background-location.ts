import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { store } from '@R/store';
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
    return;
  }

  const lastPosition = store.getState().location.lastPosition;
  if (lastPosition && currentPosition.timestamp <= lastPosition.timestamp) {
    return;
  }

  try {
    const { previousPosition, currentDuration, currentDistance, currentAltitude, currentPace } =
      getMetricsTaskManager(currentPosition);

    saveMetricsToStoreTaskManager(
      currentPosition,
      currentDuration,
      currentPace,
      currentAltitude,
      currentDistance,
      previousPosition,
    );
  } catch (error) {
    if (__DEV__) console.error('[tracking]', 'Something went wrong when saving a new location...', error);
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
          notificationTitle: BACKGROUND_NOTIFICATION[store.getState().language.language].isActive,
          notificationBody: BACKGROUND_NOTIFICATION[store.getState().language.language].turnOff,
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
  if (error || !data?.locations?.length) {
    return;
  }

  for (const currentPosition of data.locations) {
    processLocation(currentPosition);
  }
});
