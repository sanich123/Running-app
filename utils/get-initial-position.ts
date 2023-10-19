import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';

import { errorHandler } from './error-handler';
import { setInitialLocation } from '../redux/location/location';
import { store } from '../redux/store';

type GetPositionProps = {
  setIsLoading?: (arg: boolean) => void;
  setIsError?: (arg: boolean) => void;
  setIsSuccess?: (arg: boolean) => void;
};

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
    errorHandler(error);
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
    errorHandler(error);
  }
}
