import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
  watchPositionAsync,
} from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { store } from '@R/store';
import { showCrossPlatformToast } from '@U/custom-toast';
import { getMetricsTaskManager, saveMetricsToStoreTaskManager } from './utils';
import { BACKGROUND_NOTIFICATION, DISTANCE_INTERVAL, LOCATION_TRACKING, TIME_INTERVAL } from '../const';
import type { TaskManagerLocationEvent } from '../const';
import type { LocationObject } from 'expo-location';

let foregroundLocationSubscription: { remove: () => void } | null = null;

function isMissingLocationTaskError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('TaskNotFoundException') || message.includes(`Task '${LOCATION_TRACKING}' not found`);
}

async function processLocation(currentPosition: LocationObject) {
  const lastPosition = store.getState().location.lastPosition;
  if (lastPosition && currentPosition.timestamp <= lastPosition.timestamp) {
    return;
  }

  try {
    const { currentDuration, currentDistance, currentAltitude, currentPace, currentKilometer, lastArrayLength } =
      getMetricsTaskManager(currentPosition);

    if (!lastArrayLength || lastArrayLength < 10) {
      saveMetricsToStoreTaskManager(
        currentKilometer,
        currentPosition,
        currentDuration,
        currentPace,
        currentAltitude,
        currentDistance,
      );
    }
  } catch (error) {
    if (__DEV__) console.error('[tracking]', 'Something went wrong when saving a new location...', error);
  }
}

async function startForegroundLocationTracking() {
  if (foregroundLocationSubscription) {
    return;
  }

  foregroundLocationSubscription = await watchPositionAsync(
    {
      accuracy: Accuracy.High,
      timeInterval: TIME_INTERVAL,
      distanceInterval: 0,
    },
    processLocation,
  );
}

export async function startLocationTracking() {
  if (!(await hasStartedLocationUpdatesAsync(LOCATION_TRACKING))) {
    await startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Accuracy.High,
      timeInterval: TIME_INTERVAL,
      distanceInterval: DISTANCE_INTERVAL,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: BACKGROUND_NOTIFICATION[store.getState().language.language].isActive,
        notificationBody: BACKGROUND_NOTIFICATION[store.getState().language.language].turnOff,
        notificationColor: '#333333',
      },
    });
  }

  await startForegroundLocationTracking();
  showCrossPlatformToast('BgTracking started');
}

export async function stopLocationTracking() {
  try {
    if (await hasStartedLocationUpdatesAsync(LOCATION_TRACKING)) {
      await stopLocationUpdatesAsync(LOCATION_TRACKING);
    }
  } catch (error) {
    // The task can disappear after an app restart or while Android is
    // delivering a background event. Stopping it is still considered done.
    if (!isMissingLocationTaskError(error)) {
      throw error;
    }
  }

  foregroundLocationSubscription?.remove();
  foregroundLocationSubscription = null;

  showCrossPlatformToast('BgTracking stopped');
}

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }: TaskManagerLocationEvent) => {
  if (error || !data?.locations?.length) {
    return;
  }

  for (const currentPosition of data.locations) {
    await processLocation(currentPosition);
  }
});
