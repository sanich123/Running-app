import { resetLocationsFromBackground, setEmptyLastArrayWhenPaused } from '@R/location/location';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { startLocationTracking, stopLocationTracking } from '@U/background-location';
import { STATUSES } from '@const/enums';
import { useEffect, useState } from 'react';

const { initial, paused, started, continued } = STATUSES;

export default function useStartStopTracking() {
  const { activityStatus } = useAppSelector(({ location }) => location);

  const [locationStarted, setLocationStarted] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (activityStatus === started || activityStatus === continued) {
      startLocationTracking({ setLocationStarted });
    }
    if (activityStatus === initial) {
      stopLocationTracking({ setLocationStarted });
      dispatch(resetLocationsFromBackground());
    }
    if (activityStatus === paused) {
      stopLocationTracking({ setLocationStarted });
      dispatch(setEmptyLastArrayWhenPaused());
    }
  }, [activityStatus]);

  return { activityStatus, locationStarted };
}
