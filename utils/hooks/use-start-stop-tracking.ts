import { useEffect } from 'react';
import { errorToast } from '@C/shared/error-toast/error-toast';
import { STATUSES } from '@const/enums';
import { resetLocationsFromBackground, setEmptyLastArrayWhenPaused } from '@R/slices/location/location';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { startLocationTracking, stopLocationTracking } from '@U/location/expo-task-manager/background-location';

const { initial, paused, started, continued } = STATUSES;

export default function useStartStopTracking() {
  const { activityStatus } = useAppSelector(({ location }) => location);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (activityStatus === started || activityStatus === continued) {
      startLocationTracking().catch((error) => {
        errorToast('Не удалось запустить отслеживание геопозиции', error);
      });
    } else {
      stopLocationTracking().catch((error) => {
        errorToast('Не удалось остановить отслеживание геопозиции', error);
      });
    }
    if (activityStatus === initial) {
      dispatch(resetLocationsFromBackground());
    }
    if (activityStatus === paused) {
      dispatch(setEmptyLastArrayWhenPaused());
    }
  }, [activityStatus, dispatch]);

  return { activityStatus };
}
