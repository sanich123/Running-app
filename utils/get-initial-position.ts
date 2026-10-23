import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';
import { setInitialLocation, setLocationProvider } from '@R/slices/location/location';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import { getLocationProvider, stripLocationProvider } from './location/location-provider';
import type { LocationObject } from 'expo-location';

interface GetPositionProps {
  setIsLoading: (arg: boolean) => void;
  setIsError: (arg: boolean) => void;
  setIsSuccess: (arg: boolean) => void;
}

export async function getCurrentOrLastKnownPosition() {
  try {
    return await getCurrentPositionAsync({ accuracy: 6 });
  } catch {
    return getLastKnownPositionAsync();
  }
}

export async function getLastKnownPosition({ setIsLoading, setIsError, setIsSuccess }: GetPositionProps) {
  try {
    setIsLoading(true);
    setIsError(false);
    const currentPosition: LocationObject | null = await getCurrentOrLastKnownPosition();

    if (!currentPosition) {
      throw new Error('Position is unavailable');
    }

    setIsSuccess(true);
    store.dispatch(setInitialLocation(stripLocationProvider(currentPosition)));
    store.dispatch(setLocationProvider(getLocationProvider(currentPosition)));
    setTimeout(() => setIsSuccess(false), 2000);
  } catch (error) {
    setIsLoading(false);
    setIsError(true);
    setTimeout(() => setIsError(false), 2000);
    errorToast('Не удалось получить геопозицию', error);
  } finally {
    setIsLoading(false);
  }
}
