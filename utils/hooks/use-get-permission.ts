import { requestForegroundPermissionsAsync, requestBackgroundPermissionsAsync } from 'expo-location';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function useGetPermissions() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
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
    }
  }, []);
}
