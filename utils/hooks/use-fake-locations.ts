import { Camera } from '@rnmapbox/maps';
import { LocationObject } from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { MOCK_LOCATIONS } from '../../constants/mocks/mocks';
import { generateNextLocation, getDistance } from '../location-utils';

export default function useFakeLocations() {
  const { initialLocation } = useSelector(({ location }) => location);
  const [status, setStatus] = useState(STATUSES.initial);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [locations, setLocations] = useState<LocationObject[]>([initialLocation || MOCK_LOCATIONS[0]]);
  const cameraRef = useRef<Camera>(null);
  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (status === STATUSES.started || status === STATUSES.continue) {
      interval = setInterval(() => setDuration((stateDuration) => stateDuration + 1), 2000);
      return () => clearInterval(interval);
    }
    if (status === STATUSES.initial) {
      clearInterval(interval);
      setDuration(0);
      setLocations(initialLocation);
      setDistance(0);
    }
    if (status === STATUSES.paused) {
      clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const currentLocation = generateNextLocation(locations[locations.length - 1]);
    setLocations([...locations, currentLocation]);
    const currDistance = locations[0] ? getDistance(locations[0], currentLocation) : 0;
    setDistance(distance + currDistance);
  }, [duration]);

  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: [
        locations[locations.length - 1].coords.longitude,
        locations[locations.length - 1].coords.latitude,
      ],
    });
  }, [locations]);

  return {
    locations,
    lastView: [locations[locations.length - 1].coords.longitude, locations[locations.length - 1].coords.latitude],
    cameraRef,
    setStatus,
    duration,
    status,
    distance,
  };
}
