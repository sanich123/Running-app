import { requestForegroundPermissionsAsync, requestBackgroundPermissionsAsync } from 'expo-location';
import { useEffect } from 'react';

export default function useGetPermissions() {
  useEffect(() => {
    (async () => {
      const foregroundPermission = await requestForegroundPermissionsAsync();
      if (foregroundPermission.granted) {
        const backgroundPermission = await requestBackgroundPermissionsAsync();
        if (backgroundPermission.granted) {
          if (!process.env.IS_TESTING) {
            console.log('Permission to access location granted');
          }
        }
      }
    })();
  }, []);
}
