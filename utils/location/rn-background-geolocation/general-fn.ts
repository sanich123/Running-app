import { setIsTooMuchSpeed } from '@R/location/location';
import { store } from '@R/store';
import { Location } from 'react-native-background-geolocation';

import { getMetrics, saveMetricsToStore } from './utils';

export async function saveMetricsFromBackgroundToRedux(currentPosition: Location) {
  try {
    const { currentDuration, currentDistance, currentAltitude, currentPace, currentKilometer, lastArrayLength } =
      getMetrics(currentPosition);

    if (!lastArrayLength || lastArrayLength < 10) {
      saveMetricsToStore(
        currentKilometer,
        currentPosition,
        currentDuration,
        currentPace,
        currentAltitude,
        currentDistance,
      );
    } else if (currentPace > 3 && currentPace < Infinity) {
      saveMetricsToStore(
        currentKilometer,
        currentPosition,
        currentDuration,
        currentPace,
        currentAltitude,
        currentDistance,
      );
    } else {
      store.dispatch(setIsTooMuchSpeed(true));
      if (__DEV__) console.log('That was wrong position', 'currentPace: ', currentPace);
    }
  } catch (error) {
    if (__DEV__) console.log('[tracking]', 'Something went wrong when saving a new location...', error);
  }
}
