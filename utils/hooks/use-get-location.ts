import Mapbox from '@rnmapbox/maps';
import {
  LocationObject,
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  requestBackgroundPermissionsAsync,
} from 'expo-location';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '../../redux/hooks/hooks';
import { setInitialLocation } from '../../redux/location/location';

export default function useGetLocation() {
  Mapbox.setWellKnownTileServer('Mapbox');
  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

  const [location, setLocation] = useState<LocationObject>();
  // const [error, setError] = useState(false);
  const [readyToShowLocation, setReadyToShowLocation] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      const foregroundPermission = await requestForegroundPermissionsAsync();
      if (foregroundPermission.granted) {
        const backgroundPermission = await requestBackgroundPermissionsAsync();
        if (backgroundPermission.granted) {
          console.log('Permission to access location granted');
          const currentPosition = await getCurrentPositionAsync();
          console.log(`Received currentPosition`, currentPosition);
          if (currentPosition) {
            setLocation(currentPosition);
            setReadyToShowLocation(true);
            dispatch(setInitialLocation(currentPosition));
          }
        }
      }
    })();
  }, []);

  return { location, readyToShowLocation };
}
