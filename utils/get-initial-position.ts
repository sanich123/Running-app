import { getCurrentPositionAsync, getLastKnownPositionAsync } from 'expo-location';

import { errorHandler } from './error-handler';
import { setInitialLocation, setLocationsFromBackground } from '../redux/location/location';
import { store } from '../redux/store';

export async function getLastKnownPosition(setIsLoading?: (arg: boolean) => void) {
  try {
    setIsLoading(true);
    const currentPosition = await getLastKnownPositionAsync();
    store.dispatch(setInitialLocation(currentPosition));
    store.dispatch(setLocationsFromBackground(currentPosition));
    setIsLoading(false);
  } catch (error) {
    errorHandler(error);
  }
}

export async function getExactPosition(setIsLoading?: (arg: boolean) => void) {
  try {
    setIsLoading(true);
    const currentPosition = await getCurrentPositionAsync();
    store.dispatch(setInitialLocation(currentPosition));
    store.dispatch(setLocationsFromBackground(currentPosition));
    setIsLoading(false);
  } catch (error) {
    errorHandler(error);
  }
}
