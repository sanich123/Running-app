import Mapbox from '@rnmapbox/maps';
import {
  LocationObject,
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  startLocationUpdatesAsync,
  requestBackgroundPermissionsAsync,
} from 'expo-location';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '../../redux/hooks/hooks';
import { setInitialLocation } from '../../redux/location/location';

export default function useGetLocation() {
  Mapbox.setWellKnownTileServer('Mapbox');
  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

  const [location, setLocation] = useState<LocationObject>();
  const [error, setError] = useState(false);
  const [readyToShowLocation, setReadyToShowLocation] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        const foregroundPermission = await requestForegroundPermissionsAsync();
        if (!foregroundPermission.granted) {
          setError(true);
          return;
        }
        const backgroundPermission = await requestBackgroundPermissionsAsync();
        if (!backgroundPermission.granted) {
          setError(true);
          return;
        } else {
          await startLocationUpdatesAsync('BACKGROUND_LOCATION_TASK', {
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: 'Location',
              notificationBody: 'Location tracking in background',
              notificationColor: '#fff',
            },
          });
        }
        const currentPosition = await getCurrentPositionAsync();
        console.log(`Received currentPosition`, currentPosition);
        if (currentPosition) {
          setLocation(currentPosition);
          setReadyToShowLocation(true);
          dispatch(setInitialLocation(currentPosition));
        }
      } catch {
        setError(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { location, error, readyToShowLocation };
}
