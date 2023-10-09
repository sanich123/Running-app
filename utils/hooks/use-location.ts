import { LocationObject } from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import * as DistanceStorage from '../storage/distance-service';
import * as DurationStorage from '../storage/duration-service';
import * as LocationStorage from '../storage/location-service';

export function useLocationData(interval = 3000) {
  const locations = useRef<LocationObject[]>([]);
  const distance = useRef<number>(0);
  const duration = useRef<number>(0);
  const [, setCount] = useState(0);

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

  return {
    storedLocations: locations.current,
    storedDuration: duration.current,
    storedDistance: distance.current,
  };
}
