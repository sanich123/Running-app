import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
  LocationObject,
} from 'expo-location';
import { isTaskRegisteredAsync } from 'expo-task-manager';
import * as TaskManager from 'expo-task-manager';
import { ToastAndroid } from 'react-native';

import { getMetrics, saveMetricsToStore } from './save-to-store-metrics';
import { LOCATION_TRACKING } from '../constants/location';

export async function startLocationTracking({ setLocationStarted }: { setLocationStarted: (arg: boolean) => void }) {
  await startLocationUpdatesAsync(LOCATION_TRACKING, {
    accuracy: Accuracy.BestForNavigation,
    timeInterval: 3000,
    distanceInterval: 0,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Runich is active',
      notificationBody: 'To turn off, go back to the app and switch something off.',
      notificationColor: '#333333',
    },
  });
  const hasStarted = await hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
  setLocationStarted(hasStarted);
  console.log('tracking started?', hasStarted);
  ToastAndroid.show(`BgTracking started = ${hasStarted}`, ToastAndroid.SHORT);
}

export async function stopLocationTracking({ setLocationStarted }: { setLocationStarted?: (arg: boolean) => void }) {
  setLocationStarted(false);
  isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
    if (tracking) {
      stopLocationUpdatesAsync(LOCATION_TRACKING);

      ToastAndroid.show(`BgTracking stopped`, ToastAndroid.SHORT);
    }
  });
}

type TaskManagerLocationEvent = {
  data: { locations: LocationObject[] };
  error: TaskManager.TaskManagerError;
};

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
        getMetrics(currentPosition);

      if (!lastArrayLength || lastArrayLength < 10) {
        saveMetricsToStore(
          currentKilometer,
          currentPosition,
          currentDuration,
          currentPace,
          currentAltitude,
          currentDistance,
        );
      } else if (currentPace > 3 && currentPace < Infinity) {
        saveMetricsToStore(
          currentKilometer,
          currentPosition,
          currentDuration,
          currentPace,
          currentAltitude,
          currentDistance,
        );
      } else {
        console.log('That was wrong position', 'currentPace: ', currentPace);
      }
    } catch (error) {
      console.log('[tracking]', 'Something went wrong when saving a new location...', error);
    }
  }
});
