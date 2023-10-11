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

import { getDistance } from './location-utils';
import { addDistance } from './storage/distance-service';
import { addDuration } from './storage/duration-service';
import { addLocation, getLocations } from './storage/location-service';
import { LOCATION_TRACKING } from '../constants/location';

export async function startLocationTracking({ setLocationStarted }: { setLocationStarted: (arg: boolean) => void }) {
  await startLocationUpdatesAsync(LOCATION_TRACKING, {
    accuracy: Accuracy.BestForNavigation,
    timeInterval: 1000,
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

export async function stopLocationTracking({ setLocationStarted }: { setLocationStarted: (arg: boolean) => void }) {
  setLocationStarted(false);
  isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
    if (tracking) {
      stopLocationUpdatesAsync(LOCATION_TRACKING);
      ToastAndroid.show(`BgTracking stopped`, ToastAndroid.SHORT);
    }
  });
}

TaskManager.defineTask(
  LOCATION_TRACKING,
  async ({ data, error }: { data: { locations: LocationObject[] }; error: TaskManager.TaskManagerError }) => {
    if (error) {
      console.log('LOCATION_TRACKING task ERROR:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      const currentPosition = locations[0];
      try {
        const positionsInStorage = await getLocations();
        const previousPosition =
          positionsInStorage.length > 0 ? positionsInStorage[positionsInStorage.length - 1] : null;
        const currentDuration = previousPosition ? currentPosition.timestamp - previousPosition.timestamp : 0;
        const currentDistance = previousPosition ? getDistance(previousPosition, currentPosition) : 0;
        await addDistance(currentDistance);
        await addDuration(currentDuration);
        await addLocation(currentPosition);
      } catch (error) {
        console.log('[tracking]', 'Something went wrong when saving a new location...', error);
      }
    }
  },
);
