import { Camera } from '@rnmapbox/maps';
import {
  Accuracy,
  LocationObject,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { isTaskRegisteredAsync } from 'expo-task-manager';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { resetLocationsFromBackground, setLocationsFromBackground } from '../../redux/location/location';
import { store } from '../../redux/store';
import { getDistance } from '../location-utils';

const { initial, paused, started, continued } = STATUSES;

const LOCATION_TRACKING = 'location-tracking';

export default function useUserLocation() {
  const { locationsFromBackground } = useSelector(({ location }) => location);
  console.log('from redux in hook', locationsFromBackground, locationsFromBackground.length);
  const { initialLocation } = useSelector(({ location }) => location);
  // const [locations, setLocations] = useState<LocationObject[]>([initialLocation]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState(STATUSES.initial);

  const dispatch = useDispatch();
  const cameraRef = useRef<Camera>(null);
  const [locationStarted, setLocationStarted] = useState(false);

  const lastPosition =
    locationsFromBackground.length > 0 ? locationsFromBackground[locationsFromBackground.length - 1] : initialLocation;

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (status === started || status === continued) {
      interval = setInterval(() => setDuration((stateDuration) => stateDuration + 1), 1000);
      return () => clearInterval(interval);
    }
    if (status === initial) {
      clearInterval(interval);
      setDuration(0);
      setDistance(0);
      dispatch(resetLocationsFromBackground());
    }
    if (status === paused) {
      clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const currentDistance =
      locationsFromBackground.length > 1
        ? getDistance(
            locationsFromBackground[locationsFromBackground.length - 1],
            locationsFromBackground[locationsFromBackground.length - 2],
          )
        : 0;
    setDistance((distance) => distance + currentDistance);
  }, [locationsFromBackground]);

  async function startLocationTracking() {
    await startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    });
    const hasStarted = await hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
    setLocationStarted(hasStarted);
    console.log('tracking started?', hasStarted);
  }
  async function stopLocationTracking() {
    setLocationStarted(false);
    isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  }

  useEffect(() => {
    if (status === started || status === continued) {
      startLocationTracking();
    }
    if (status === initial || status === paused) {
      stopLocationTracking();
    }
  }, [status]);

  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: [lastPosition?.coords.longitude, lastPosition?.coords.latitude],
    });
  }, []);

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
      const position = locations[0];
      console.log('position from background', position);
      store.dispatch(setLocationsFromBackground(position));
    }
  },
);

// async function setPosition() {
//   const locationSubscription = await watchPositionAsync(
//     { accuracy: Accuracy.Highest, timeInterval: 5000, distanceInterval: 0 },
//     (position: LocationObject) => {
//       console.log(`position from android ${new Date(Date.now())}`, position);
//       const currentDistance = locations[0] ? getDistance(lastPosition, position) : 0;
//       setDistance((distance) => distance + currentDistance);
//       setLocations((locations) => [...locations, position]);
//     },
//   );
//   setSubscribeIdToPositionUpdates(locationSubscription);
// }
