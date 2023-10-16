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

import { getDistance, getSpeedInMinsInKm } from './location-utils';
import { LOCATION_TRACKING } from '../constants/location';
import {
  setLocationsFromBackground,
  setDistance,
  setDuration,
  resetLastKm,
  setLastKm,
  setLastKmDuration,
  addDurationAndLocationToKmSplits,
  setCurrentPace,
  setAltitude,
  setLastKmAltitude,
} from '../redux/location/location';
import { store } from '../redux/store';

export async function startLocationTracking({ setLocationStarted }: { setLocationStarted: (arg: boolean) => void }) {
  await startLocationUpdatesAsync(LOCATION_TRACKING, {
    accuracy: Accuracy.BestForNavigation,
    timeInterval: 2000,
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
        const { locationsFromBackground, lastKilometer } = store.getState().location;
        const previousPosition =
          locationsFromBackground.length > 0 ? locationsFromBackground[locationsFromBackground.length - 1] : null;
        const currentDuration = previousPosition ? currentPosition.timestamp - previousPosition.timestamp : 0;
        const currentDistance = previousPosition ? getDistance(previousPosition, currentPosition) : 0;
        const currentAltitude = previousPosition
          ? currentPosition.coords.altitude - previousPosition.coords.altitude
          : 0;

        const currentPace =
          currentDistance && currentDuration ? getSpeedInMinsInKm(currentDistance, currentDuration) : 0;
        const currentKilometer = lastKilometer + currentDistance;

        console.log(
          `currDuration: ${currentDuration}, currDistance: ${currentDistance}, currAltitude: ${currentAltitude}, currPace: ${currentPace}, currKilometer: ${currentKilometer}`,
        );

        if (currentKilometer >= 1000) {
          store.dispatch(addDurationAndLocationToKmSplits(currentPosition));
          store.dispatch(resetLastKm());
        } else {
          store.dispatch(setLastKm(currentDistance));
          store.dispatch(setLastKmDuration(currentDuration));
          store.dispatch(setCurrentPace(currentPace));
          store.dispatch(setLastKmAltitude(currentAltitude));
        }
        store.dispatch(setLocationsFromBackground(currentPosition));
        store.dispatch(setDistance(currentDistance));
        store.dispatch(setDuration(currentDuration));
        store.dispatch(setCurrentPace(currentPace));
        store.dispatch(setAltitude(currentAltitude));
      } catch (error) {
        console.log('[tracking]', 'Something went wrong when saving a new location...', error);
      }
    }
  },
);
