import {
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  hasServicesEnabledAsync,
} from 'expo-location';
import { errorToast } from '@C/shared/error-toast/error-toast';

export async function getLocationPermissions({
  setIsForegroundPermission,
  setBackgroundPermission,
  setLocationEnabledByUser,
}: {
  setIsForegroundPermission: (arg: boolean) => void;
  setBackgroundPermission: (arg: boolean) => void;
  setLocationEnabledByUser: (arg: boolean) => void;
}) {
  try {
  const isLocationServicesEnabled = await hasServicesEnabledAsync();
  if (!isLocationServicesEnabled) {
    errorToast('Для работы сервиса необходимо включить геолокацию.');
  }

  setLocationEnabledByUser(isLocationServicesEnabled);
  const foregroundPermission = await requestForegroundPermissionsAsync();
  if (foregroundPermission.granted) {
    setIsForegroundPermission(true);
    const backgroundPermission = await requestBackgroundPermissionsAsync();
    if (backgroundPermission.granted) {
      setBackgroundPermission(true);
    } else {
      errorToast(
        'Вы же не будете бегать с включенным дисплеем все время? Поэтому необходимо дать разрешение на отслеживание местоположения в фоновом режиме',
      );
    }
  }
  } catch (error) {
    errorToast('Не удалось получить разрешения на геолокацию', error);
  }
}
