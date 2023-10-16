import Mapbox from '@rnmapbox/maps';
import { requestForegroundPermissionsAsync, requestBackgroundPermissionsAsync } from 'expo-location';
import { useEffect } from 'react';

export default function useGetPermissions() {
  Mapbox.setWellKnownTileServer('Mapbox');
  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

  useEffect(() => {
    (async () => {
      const foregroundPermission = await requestForegroundPermissionsAsync();
      if (foregroundPermission.granted) {
        const backgroundPermission = await requestBackgroundPermissionsAsync();
        if (backgroundPermission.granted) {
          console.log('Permission to access location granted');
        }
      }
    })();
  }, []);
}
