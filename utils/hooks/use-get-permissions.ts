import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { hasServicesEnabledAsync, useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
import { useEffect, useRef, useState } from 'react';

//@ts-expect-error просто нет типов в пакете
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';

export default function useGetPermissions() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const locationEnabledModalRef = useRef<BottomSheetModal>(null);
  const foregroundLocationEnableModalRef = useRef<BottomSheetModal>(null);
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const batteryOptimizationEnabledModalRef = useRef<BottomSheetModal>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [foregroudPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();

  const [userGetBackFromEnablingLocation, setUserGetBackFromEnablingLocation] = useState(false);
  const [userGetBackToApp, setUserGetBackToApp] = useState(false);
  const [isAppOptimizedByPhone, setIsAppOptimizedByPhone] = useState(false);
  useEffect(() => {
    if (userGetBackFromEnablingLocation) {
      //здесь принимаем на веру, что юзер включил локацию в настройках, потом продумать лучше
      setIsLocationEnabled(true);
      setUserGetBackFromEnablingLocation(false);
    }
  }, [isLocationEnabled, userGetBackFromEnablingLocation]);

  useEffect(() => {
    async function isLocationServicesEnabled() {
      const isLocationServicesEnabled = await hasServicesEnabledAsync();
      setIsLocationEnabled(isLocationServicesEnabled);
      if (!isLocationServicesEnabled) {
        locationEnabledModalRef.current?.present();
      }
    }
    isLocationServicesEnabled();
  }, []);

  useEffect(() => {
    if (isLocationEnabled && foregroudPermissionStatus) {
      if (!foregroudPermissionStatus.granted) {
        foregroundLocationEnableModalRef.current?.present();
      }
    }
  }, [foregroudPermissionStatus, isLocationEnabled]);

  useEffect(() => {
    if (isLocationEnabled && foregroudPermissionStatus && backgroundPermissionStatus) {
      if (foregroudPermissionStatus.granted && !backgroundPermissionStatus.granted) {
        backgroundLocationEnabledModalRef.current?.present();
      }
    }
  }, [foregroudPermissionStatus, isLocationEnabled, backgroundPermissionStatus]);

  useEffect(() => {
    if (
      (isLocationEnabled && foregroudPermissionStatus?.granted && backgroundPermissionStatus?.granted) ||
      (userGetBackToApp && !isAppOptimizedByPhone)
    ) {
      BatteryOptEnabled().then((isEnabled: boolean) => {
        if (isEnabled) {
          setIsAppOptimizedByPhone(true);
          batteryOptimizationEnabledModalRef.current?.present();
        }
        setUserGetBackToApp(false);
      });
    }
  }, [
    foregroudPermissionStatus,
    isLocationEnabled,
    backgroundPermissionStatus,
    userGetBackToApp,
    isAppOptimizedByPhone,
  ]);

  return {
    bottomSheetModalRef,
    locationEnabledModalRef,
    foregroundLocationEnableModalRef,
    backgroundLocationEnabledModalRef,
    batteryOptimizationEnabledModalRef,
    isLocationEnabled,
    setIsLocationEnabled,
    backgroundPermissionStatus,
    requestBackgroundPermission,
    foregroudPermissionStatus,
    requestForegroundPermission,
    userGetBackFromEnablingLocation,
    setUserGetBackFromEnablingLocation,
    userGetBackToApp,
    setUserGetBackToApp,
    isAppOptimizedByPhone,
    setIsAppOptimizedByPhone,
  };
}
