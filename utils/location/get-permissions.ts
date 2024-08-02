import { requestBackgroundPermissionsAsync, requestForegroundPermissionsAsync } from 'expo-location';

export async function getLocationPermissions({
  setIsForegroundPermission,
  setBackgroundPermission,
}: {
  setIsForegroundPermission: (arg: boolean) => void;
  setBackgroundPermission: (arg: boolean) => void;
}) {
  const foregroundPermission = await requestForegroundPermissionsAsync();
  if (foregroundPermission.granted) {
    setIsForegroundPermission(true);
    const backgroundPermission = await requestBackgroundPermissionsAsync();
    if (backgroundPermission.granted) {
      setBackgroundPermission(true);
      if (__DEV__) console.log('Permission to access location granted');
    }
  }
}
