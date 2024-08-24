import { showCrossPlatformToast, ToastDuration } from '@U/custom-toast';
import {
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  hasServicesEnabledAsync,
} from 'expo-location';

export async function getLocationPermissions({
  setIsForegroundPermission,
  setBackgroundPermission,
  setLocationEnabledByUser,
}: {
  setIsForegroundPermission: (arg: boolean) => void;
  setBackgroundPermission: (arg: boolean) => void;
  setLocationEnabledByUser: (arg: boolean) => void;
}) {
  const isLocationServicesEnabled = await hasServicesEnabledAsync();
  if (!isLocationServicesEnabled) {
    showCrossPlatformToast('Для работы сервиса необходимо включить геолокацию.', ToastDuration.long);
  }

  setLocationEnabledByUser(isLocationServicesEnabled);
  const foregroundPermission = await requestForegroundPermissionsAsync();
  if (foregroundPermission.granted) {
    setIsForegroundPermission(true);
    const backgroundPermission = await requestBackgroundPermissionsAsync();
    if (backgroundPermission.granted) {
      setBackgroundPermission(true);
      if (__DEV__) console.log('Permission to access location granted');
    } else {
      showCrossPlatformToast(
        'Вы же не будете бегать с включенным дисплеем все время? Поэтому необходимо дать разрешение на отслеживание местоположения в фоновом режиме',
        ToastDuration.long,
      );
    }
  }
}
