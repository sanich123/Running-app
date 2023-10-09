import { Camera } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { LOCATION_TRACKING } from '../../constants/location';
import {
  resetLocationsFromBackground,
  setDistance,
  setDuration,
  setLocationsFromBackground,
} from '../../redux/location/location';
import { store } from '../../redux/store';
import { startLocationTracking, stopLocationTracking } from '../background-location';
import { getDistance } from '../location-utils';
import { addDistance, clearDistance } from '../storage/distance-service';
import { addDuration, clearDuration } from '../storage/duration-service';
import { addLocation, clearLocations, getLocations } from '../storage/location-service';

const { initial, paused, started, continued } = STATUSES;

export default function useUserLocation(interval = 3000) {
  const { locationsFromBackground, distance, duration } = useSelector(({ location }) => location);
  // console.log('locations from redux', locationsFromBackground, locationsFromBackground.length);
  const { initialLocation } = useSelector(({ location }) => location);
  const [status, setStatus] = useState(STATUSES.initial);

  const dispatch = useDispatch();
  const cameraRef = useRef<Camera>(null);
  const [locationStarted, setLocationStarted] = useState(false);

  const lastPosition =
    locationsFromBackground.length > 0 ? locationsFromBackground[locationsFromBackground.length - 1] : initialLocation;

  useEffect(() => {
    if (status === started || status === continued) {
      startLocationTracking({ setLocationStarted });
    }
    if (status === initial) {
      stopLocationTracking({ setLocationStarted });
      dispatch(resetLocationsFromBackground());
      clearLocations();
      clearDuration();
      clearDistance();
    }
    if (status === paused) {
      stopLocationTracking({ setLocationStarted });
    }
  }, [status]);

  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: [lastPosition?.coords.longitude, lastPosition?.coords.latitude],
    });
  }, [locationsFromBackground]);

  return {
    locations: locationsFromBackground,
    lastView: [lastPosition?.coords.longitude, lastPosition?.coords.latitude],
    cameraRef,
    setStatus,
    duration,
    status,
    distance,
  };
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
      const positionsInRedux = store.getState().location.locationsFromBackground;
      const previousPosition = positionsInRedux.length > 0 ? positionsInRedux[positionsInRedux.length - 1] : null;
      const currentDuration = previousPosition ? currentPosition.timestamp - previousPosition.timestamp : 0;
      const currentDistance = previousPosition ? getDistance(previousPosition, currentPosition) : 0;
      store.dispatch(setDistance(currentDistance));
      store.dispatch(setDuration(currentDuration));
      store.dispatch(setLocationsFromBackground(currentPosition));
    }
  },
);
