import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import { isTaskRegisteredAsync } from 'expo-task-manager';

import { LOCATION_TRACKING } from '../constants/location';

export async function startLocationTracking({ setLocationStarted }: { setLocationStarted: (arg: boolean) => void }) {
  await startLocationUpdatesAsync(LOCATION_TRACKING, {
    accuracy: Accuracy.Highest,
    timeInterval: 5000,
    distanceInterval: 0,
  });
  const hasStarted = await hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
  setLocationStarted(hasStarted);
  console.log('tracking started?', hasStarted);
}

export async function stopLocationTracking({ setLocationStarted }: { setLocationStarted: (arg: boolean) => void }) {
  setLocationStarted(false);
  isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
    if (tracking) {
      stopLocationUpdatesAsync(LOCATION_TRACKING);
    }
  });
}
