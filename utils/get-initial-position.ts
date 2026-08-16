import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';
import { setInitialLocation } from '@R/slices/location/location';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import type { LocationObject } from 'expo-location';

interface GetPositionProps {
  setIsLoading: (arg: boolean) => void;
  setIsError: (arg: boolean) => void;
  setIsSuccess: (arg: boolean) => void;
}

export async function getLastKnownPosition({ setIsLoading, setIsError, setIsSuccess }: GetPositionProps) {
  try {
    setIsLoading(true);
    setIsError(false);
    let currentPosition: LocationObject | null = null;

    try {
      currentPosition = await getCurrentPositionAsync({ accuracy: 6 });
    } catch {
      currentPosition = await getLastKnownPositionAsync();
    }

    if (!currentPosition) {
      throw new Error('Position is unavailable');
    }

    setIsSuccess(true);
    store.dispatch(setInitialLocation(currentPosition));
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
