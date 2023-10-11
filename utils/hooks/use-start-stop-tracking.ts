import { useEffect, useState } from 'react';

import { STATUSES } from '../../constants/enums';
import { startLocationTracking, stopLocationTracking } from '../background-location';
import { clearDistance } from '../storage/distance-service';
import { clearDuration } from '../storage/duration-service';
import { clearLocations } from '../storage/location-service';

const { initial, paused, started, continued } = STATUSES;

export default function useStartStopTracking() {
  const [status, setStatus] = useState(STATUSES.initial);
  const [locationStarted, setLocationStarted] = useState(false);

  useEffect(() => {
    if (status === started || status === continued) {
      startLocationTracking({ setLocationStarted });
    }
    if (status === initial) {
      stopLocationTracking({ setLocationStarted });
      clearLocations();
      clearDuration();
      clearDistance();
    }
    if (status === paused) {
      stopLocationTracking({ setLocationStarted });
    }
  }, [status]);

  return { setStatus, status, locationStarted };
}
