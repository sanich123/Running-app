import { Camera } from '@rnmapbox/maps';
import { Accuracy, LocationObject, watchPositionAsync } from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { STATUSES } from '../../constants/enums';
import { getDistance } from '../location-utils';

const { initial, paused, started, continued } = STATUSES;

export default function useUserLocation() {
  const { initialLocation } = useSelector(({ location }) => location);
  const [locations, setLocations] = useState<LocationObject[]>([initialLocation]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState(STATUSES.initial);
  const [subscribeIdToPositionUpdates, setSubscribeIdToPositionUpdates] = useState(null);

  const cameraRef = useRef<Camera>(null);

  const lastPosition = locations.length ? locations[locations.length - 1] : initialLocation;

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (status === started || status === continued) {
      interval = setInterval(() => setDuration((stateDuration) => stateDuration + 1), 2000);
      setPosition();
      return () => clearInterval(interval);
    }
    if (status === initial) {
      clearInterval(interval);
      setDuration(0);
      setLocations([initialLocation]);
      setDistance(0);
    }
    if (status === paused) {
      clearInterval(interval);
      subscribeIdToPositionUpdates?.remove();
    }
  }, [status]);

  async function setPosition() {
    const locationSubscription = await watchPositionAsync(
      { accuracy: Accuracy.Highest, timeInterval: 5000, distanceInterval: 0 },
      (position: LocationObject) => {
        console.log(`position from android ${new Date(Date.now())}`, position);
        const currentDistance = locations[0] ? getDistance(lastPosition, position) : 0;
        setDistance(distance + currentDistance);
        setLocations((locations) => [...locations, position]);
      },
    );
    setSubscribeIdToPositionUpdates(locationSubscription);
  }

  useEffect(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: [lastPosition?.coords.longitude, lastPosition?.coords.latitude],
    });
  }, []);

  return {
    locations,
    lastView: [lastPosition?.coords.longitude, lastPosition?.coords.latitude],
    cameraRef,
    setStatus,
    duration,
    status,
    distance,
  };
}
