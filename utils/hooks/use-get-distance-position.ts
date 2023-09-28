import { MapView } from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import { LocationObject, watchPositionAsync } from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { POSITION_OPTIONS } from '../../constants/const';

export default function useGetDistancePosition({ initialLocation }: { initialLocation: LocationObject }) {
  const [positions, setPositions] = useState<LocationObject[]>([]);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const mapRef = useRef<MapView>(null);

  function distanceBetween(origin: LocationObject, destination: LocationObject) {
    const from = turf.point([origin.coords.longitude, origin.coords.latitude]);
    const to = turf.point([destination.coords.longitude, destination.coords.latitude]);
    return turf.distance(from, to, { units: 'meters' });
  }

  function paceBetween(distance: number, from: LocationObject, to: LocationObject) {
    return Math.round((to.timestamp - from.timestamp) / distance);
  }
  const currentPosition = !positions.length ? initialLocation : positions[positions.length - 1];

  useEffect(() => {
    (async function setPosition() {
      return await watchPositionAsync(POSITION_OPTIONS, (position: LocationObject) => {
        const region = {
          latitudeDelta: 0.01,
          longitudeDelta: 0.0121,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };
        mapRef.current?.animateToRegion(region, 1000);
        const currDistance = positions[0] ? distanceBetween(currentPosition, position) : 0;
        // const duration = positions[0] ? position.timestamp - positions[0].timestamp : 0;
        const pace = positions[0] ? paceBetween(distance, positions[positions.length - 1], position) : 0;
        setPositions([...positions, position]);
        setDistance(distance + currDistance);
        setPace(pace);
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentPosition,
    distance,
    positions,
    pace,
    mapRef,
  };
}
