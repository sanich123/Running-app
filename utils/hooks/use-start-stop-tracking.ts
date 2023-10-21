import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { resetLocationsFromBackground, setEmptyLastArrayWhenPaused } from '../../redux/location/location';
import { startLocationTracking, stopLocationTracking } from '../background-location';

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
      dispatch(setEmptyLastArrayWhenPaused());
    }
    if (activityStatus === paused) {
      stopLocationTracking({ setLocationStarted });
      dispatch(setEmptyLastArrayWhenPaused());
    }
  }, [activityStatus]);

  return { activityStatus, locationStarted };
}
