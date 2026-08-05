import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';
import { errorToast } from '@C/shared/error-toast/error-toast';
import { setInitialLocation } from '@R/slices/location/location';
import { store } from '@R/store';

interface GetPositionProps {
  setIsLoading: (arg: boolean) => void;
  setIsError: (arg: boolean) => void;
  setIsSuccess: (arg: boolean) => void;
}

export async function getLastKnownPosition({ setIsLoading, setIsError, setIsSuccess }: GetPositionProps) {
  try {
    setIsLoading(true);
    const currentPosition = await getLastKnownPositionAsync();
    setIsLoading(false);
    setIsSuccess(true);
    store.dispatch(setInitialLocation(currentPosition));
    setTimeout(() => setIsSuccess(false), 2000);
  } catch (error) {
    setIsError(true);
    setTimeout(() => setIsError(false));
    errorToast('Не удалось получить последнюю геопозицию', error);
  }
}

export async function getExactPosition({ setIsLoading, setIsError, setIsSuccess }: GetPositionProps) {
  try {
    setIsLoading(true);
    const currentPosition = await getCurrentPositionAsync();
    setIsLoading(false);
    setIsSuccess(true);
    store.dispatch(setInitialLocation(currentPosition));
    setTimeout(() => setIsSuccess(false), 2000);
  } catch (error) {
    setIsError(true);
    errorToast('Не удалось определить геопозицию', error);
  }
}
