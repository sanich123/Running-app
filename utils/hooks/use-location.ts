import { Camera } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import * as DistanceStorage from '../storage/distance-service';
import * as DurationStorage from '../storage/duration-service';
import * as LocationStorage from '../storage/location-service';

export function useLocationData(interval = 3000) {
  const { initialLocation } = useSelector(({ location }) => location);
  const locations = useRef<LocationObject[]>([]);
  const distance = useRef<number>(0);
  const duration = useRef<number>(0);
  const cameraRef = useRef<Camera>(null);
  const [, setCount] = useState(0);
  const lastPosition = locations.current.length > 0 ? locations.current[locations.current.length - 1] : initialLocation;

  const lastView = [lastPosition?.coords.longitude, lastPosition?.coords.latitude];

  const onLocations = useCallback(
    (stored: LocationObject[]) => {
      if (stored.length !== locations.current.length) {
        locations.current = stored;
        setCount(locations.current.length);
      }
    },
    [setCount, locations],
  );

  const onDistance = useCallback(
    (storedDistance: number) => {
      distance.current = storedDistance;
      setCount(distance.current);
    },
    [setCount, distance],
  );

  const onDuration = useCallback(
    (storedDuration: number) => {
      duration.current = storedDuration;
      setCount(duration.current);
    },
    [setCount, duration],
  );

  useEffect(() => {
    LocationStorage.getLocations().then(onLocations);
    DistanceStorage.getDistance().then(onDistance);
    DurationStorage.getDuration().then(onDuration);

    const timerId = window.setInterval(() => {
      LocationStorage.getLocations().then(onLocations);
      DistanceStorage.getDistance().then(onDistance);
      DurationStorage.getDuration().then(onDuration);
    }, interval);

    return () => window.clearInterval(timerId);
  }, [interval]);

  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: lastView,
    });
  }, [locations]);

  return {
    storedLocations: locations.current,
    storedDuration: duration.current,
    storedDistance: distance.current,
    cameraRef,
    lastView,
  };
}
