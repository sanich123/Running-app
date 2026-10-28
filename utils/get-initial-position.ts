import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';
import { setInitialLocation, setLocationProvider } from '@R/slices/location/location';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import { getLocationProvider, stripLocationProvider } from './location/location-provider';
import type { LocationObject } from 'expo-location';

export async function getCurrentOrLastKnownPosition() {
  try {
    return await getCurrentPositionAsync({ accuracy: 6 });
  } catch {
    return getLastKnownPositionAsync();
  }
}

export async function getAndStoreInitialPosition() {
  try {
    const currentPosition: LocationObject | null = await getCurrentOrLastKnownPosition();

    if (!currentPosition) {
      throw new Error('Position is unavailable');
    }

    store.dispatch(setInitialLocation(stripLocationProvider(currentPosition)));
    store.dispatch(setLocationProvider(getLocationProvider(currentPosition)));
  } catch (error) {
    errorToast('Не удалось получить геопозицию', error);
  }
}
