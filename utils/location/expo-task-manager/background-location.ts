import { setIsTooMuchSpeed } from '@R/location/location';
import { store } from '@R/store';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import { isTaskRegisteredAsync } from 'expo-task-manager';
import * as TaskManager from 'expo-task-manager';

import { getMetricsTaskManager, saveMetricsToStoreTaskManager } from './utils';
import {
  BACKGROUND_NOTIFICATION,
  DISTANCE_INTERVAL,
  LOCATION_TRACKING,
  TIME_INTERVAL,
  TaskManagerLocationEvent,
} from '../const';

export async function startLocationTracking() {
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
  const hasStarted = await hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
  console.log('tracking started?', hasStarted);
  showCrossPlatformToast(`BgTracking started = ${hasStarted}`, ToastDuration.long);
}

export async function stopLocationTracking() {
  isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
    if (tracking) {
      stopLocationUpdatesAsync(LOCATION_TRACKING);
      showCrossPlatformToast(`BgTracking stopped`, ToastDuration.long);
    }
  });
}

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }: TaskManagerLocationEvent) => {
  if (error) {
    console.log('LOCATION_TRACKING task ERROR:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const currentPosition = locations[0];
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
      } else if (currentPace > 3 && currentPace < Infinity) {
        saveMetricsToStoreTaskManager(
          currentKilometer,
          currentPosition,
          currentDuration,
          currentPace,
          currentAltitude,
          currentDistance,
        );
      } else {
        store.dispatch(setIsTooMuchSpeed(true));
        console.log('That was wrong position', 'currentPace: ', currentPace);
      }
    } catch (error) {
      console.log('[tracking]', 'Something went wrong when saving a new location...', error);
    }
  }
});
