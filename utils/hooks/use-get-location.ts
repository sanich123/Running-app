import Mapbox from '@rnmapbox/maps';
import { LocationObject, requestForegroundPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '../../redux/hooks/hooks';
import { setInitialLocation } from '../../redux/location-slice/location-slice';

export default function useGetLocation() {
  Mapbox.setWellKnownTileServer('Mapbox');
  Mapbox.setAccessToken('pk.eyJ1Ijoic2FuaWNoMTIzIiwiYSI6ImNsaWFkNmptaDAyaTczcm11NHF0cmp3d2sifQ.ZKH9THateIfnZ7zC23f3-g');

  const [location, setLocation] = useState<LocationObject>();
  const [error, setError] = useState(false);
  const [readyToShowLocation, setReadyToShowLocation] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError(true);
          return;
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
