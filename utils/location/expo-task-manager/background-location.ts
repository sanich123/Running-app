import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import { isTaskRegisteredAsync } from 'expo-task-manager';
import * as TaskManager from 'expo-task-manager';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import { setIsTooMuchSpeed } from '@R/slices/location/location';
import { store } from '@R/store';
import { showCrossPlatformToast } from '@U/custom-toast';
import { getMetricsTaskManager, saveMetricsToStoreTaskManager } from './utils';
import { BACKGROUND_NOTIFICATION, DISTANCE_INTERVAL, LOCATION_TRACKING, TIME_INTERVAL } from '../const';
import type { TaskManagerLocationEvent } from '../const';

export async function startLocationTracking() {
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
  const hasStarted = await hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
  showCrossPlatformToast(`BgTracking started = ${hasStarted}`);
}

export async function stopLocationTracking() {
  isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
    if (tracking) {
      stopLocationUpdatesAsync(LOCATION_TRACKING);
      showCrossPlatformToast(`BgTracking stopped`);
    }
  });
}

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }: TaskManagerLocationEvent) => {
  if (error) {
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
      } else if (
        (currentPace > 3 && currentPace < Infinity) ||
        store.getState().additionalInfoActivity.sport === SPORTS_BTNS_VALUES.bike
      ) {
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
        showCrossPlatformToast('Геолокация отклонена из-за слишком высокой скорости относительно предыдущей точки.');
      }
    } catch (error) {
      if (__DEV__) console.error('[tracking]', 'Something went wrong when saving a new location...', error);
    }
  }
});
