import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';
import { setInitialLocation } from '@R/slices/location/location';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';

interface GetPositionProps {
  setIsLoading: (arg: boolean) => void;
  setIsError: (arg: boolean) => void;
  setIsSuccess: (arg: boolean) => void;
}

export async function getLastKnownPosition({ setIsLoading, setIsError, setIsSuccess }: GetPositionProps) {
  try {
    setIsLoading(true);
    setIsError(false);
    const currentPosition = (await getLastKnownPositionAsync()) ?? (await getCurrentPositionAsync());
    setIsSuccess(true);
    store.dispatch(setInitialLocation(currentPosition));
    setTimeout(() => setIsSuccess(false), 2000);
  } catch (error) {
    setIsLoading(false);
    setIsError(true);
    setTimeout(() => setIsError(false), 2000);
    errorToast('Не удалось получить последнюю геопозицию', error);
  } finally {
    setIsLoading(false);
  }
}

export async function getExactPosition({ setIsLoading, setIsError, setIsSuccess }: GetPositionProps) {
  try {
    setIsLoading(true);
    setIsError(false);
    const currentPosition = await getCurrentPositionAsync();
    setIsSuccess(true);
    store.dispatch(setInitialLocation(currentPosition));
    setTimeout(() => setIsSuccess(false), 2000);
  } catch (error) {
    setIsLoading(false);
    setIsError(true);
    setTimeout(() => setIsError(false), 2000);
    errorToast('Не удалось определить геопозицию', error);
  } finally {
    setIsLoading(false);
  }
}
