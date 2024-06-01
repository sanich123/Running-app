import { getLocationPermissions } from '@U/location/get-permissions';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export default function useGetPermissions() {
  const [isForegroundPermission, setIsForegroundPermission] = useState(false);
  const [isBackgroundPermission, setBackgroundPermission] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (!isForegroundPermission || !isBackgroundPermission) {
        getLocationPermissions({ setIsForegroundPermission, setBackgroundPermission });
      }
    }
  }, []);

  return { isForegroundPermission, isBackgroundPermission };
}
