import { useEffect, useRef, useState } from 'react';
import { MOCK_LOCATIONS, MOCK_LOCATIONS_IN_RIGHT_FORMAT } from '../constants/mocks/mocks';
import { Camera } from '@rnmapbox/maps';
import { getDistanceFromMocks } from '../utils/location-utils';
import { STATUSES } from '../constants/enums';
import { LocationObject } from 'expo-location';

export default function useFakeLocations() {
  const [status, setStatus] = useState(STATUSES.initial);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [locations, setLocations] = useState<LocationObject[]>([MOCK_LOCATIONS_IN_RIGHT_FORMAT[0]]);
  const camera = useRef<Camera>(null);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (status === STATUSES.started || status === STATUSES.continue) {
      interval = setInterval(() => setDuration((stateDuration) => stateDuration + 1), 2000);
      return () => clearInterval(interval);
    }
    if (status === STATUSES.initial) {
      clearInterval(interval);
      setDuration(0);
      setLocations([MOCK_LOCATIONS_IN_RIGHT_FORMAT[0]]);
      setDistance(0);
    }
    if (status === STATUSES.paused) {
      clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (duration < MOCK_LOCATIONS.length) {
      setLocations([...locations, MOCK_LOCATIONS_IN_RIGHT_FORMAT[duration]]);
      const currDistance = MOCK_LOCATIONS_IN_RIGHT_FORMAT[0]
        ? getDistanceFromMocks(MOCK_LOCATIONS_IN_RIGHT_FORMAT[0], MOCK_LOCATIONS_IN_RIGHT_FORMAT[duration])
        : 0;
      setDistance(distance + currDistance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  useEffect(() => {
    camera.current?.setCamera({
      centerCoordinate: [locations[locations.length - 1].coords.longitude, locations[locations.length - 1].coords.latitude],
    });
  }, [locations]);

  return {
    locations,
    lastView: [locations[locations.length - 1].coords.longitude, locations[locations.length - 1].coords.latitude],
    cameraRef: camera,
    setStatus,
    duration,
    status,
    distance,
  };
}
