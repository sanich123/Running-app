import { resetLocationsFromBackground, setEmptyLastArrayWhenPaused } from '@R/location/location';
import { startLocationTracking, stopLocationTracking } from '@U/background-location';
import { STATUSES } from '@const/enums';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const { initial, paused, started, continued } = STATUSES;

export default function useStartStopTracking() {
  const { activityStatus } = useSelector(({ location }) => location);

  const [locationStarted, setLocationStarted] = useState(false);
  const dispatch = useDispatch();

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
