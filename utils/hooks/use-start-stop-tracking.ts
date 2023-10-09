import { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';

import { STATUSES } from '../../constants/enums';
import { LOCATION_TRACKING } from '../../constants/location';
import { startLocationTracking, stopLocationTracking } from '../background-location';
import { getDistance } from '../location-utils';
import { addDistance, clearDistance } from '../storage/distance-service';
import { addDuration, clearDuration } from '../storage/duration-service';
import { addLocation, clearLocations, getLocations } from '../storage/location-service';

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

TaskManager.defineTask(
  LOCATION_TRACKING,
  async ({ data, error }: { data: { locations: LocationObject[] }; error: TaskManager.TaskManagerError }) => {
    if (error) {
      console.log('LOCATION_TRACKING task ERROR:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      const currentPosition = locations[0];
      try {
        const positionsInStorage = await getLocations();
        const previousPosition =
          positionsInStorage.length > 0 ? positionsInStorage[positionsInStorage.length - 1] : null;
        const currentDuration = previousPosition ? currentPosition.timestamp - previousPosition.timestamp : 0;
        const currentDistance = previousPosition ? getDistance(previousPosition, currentPosition) : 0;
        await addDistance(currentDistance);
        await addDuration(currentDuration);
        await addLocation(currentPosition);
      } catch (error) {
        console.log('[tracking]', 'Something went wrong when saving a new location...', error);
      }
    }
  },
);
