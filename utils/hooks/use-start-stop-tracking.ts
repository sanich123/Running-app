import { resetLocationsFromBackground, setEmptyLastArrayWhenPaused } from '@R/location/location';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { startLocationTracking, stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { STATUSES } from '@const/enums';
import { useEffect } from 'react';

const { initial, paused, started, continued } = STATUSES;

export default function useStartStopTracking() {
  const { activityStatus } = useAppSelector(({ location }) => location);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (activityStatus === started || activityStatus === continued) {
      startLocationTracking();
    } else {
      stopLocationTracking();
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
