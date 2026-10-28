import { useCallback, useEffect, useState } from 'react';
import { getCurrentPositionAsync, useBackgroundPermissions, useForegroundPermissions } from 'expo-location';
// @ts-expect-error package has no types
import { BatteryOptEnabled } from 'react-native-battery-optimization-check';
import { Platform } from 'react-native';
import { setLocationProvider } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getLocationProvider } from '@U/location/location-provider';
import useActivityMapCamera from './use-activity-map-camera';
import type { LocationObject } from 'expo-location';

export default function useActivityMap(onLocationReadinessChange: (isReady: boolean) => void) {
  const { isMapVisible, lastPosition, initialLocation, locationProvider } = useAppSelector(({ location }) => location);
  const currentPosition: LocationObject | null = lastPosition ?? initialLocation;
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isProfileFilled, language } = useAppSelector(({ settings }) => settings);
  const [isLocationServicesEnabled, setIsLocationServicesEnabled] = useState(false);
  const [foregroundPermissionStatus, requestForegroundPermission] = useForegroundPermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] = useBackgroundPermissions();
  const [shouldRefreshPermissionStatus, setShouldRefreshPermissionStatus] = useState(false);
  const [isBatteryOptimizationActive, setIsBatteryOptimizationActive] = useState(false);
  const [isCenteringOnCurrentLocation, setIsCenteringOnCurrentLocation] = useState(false);
  const canUseLocation = Boolean(
    userId && foregroundPermissionStatus?.granted && backgroundPermissionStatus?.granted && isProfileFilled,
  );
  const canRenderMap = Boolean(canUseLocation && (Platform.OS !== 'android' || isLocationServicesEnabled));
  const isLoadingLocationPrerequisites = foregroundPermissionStatus === null || backgroundPermissionStatus === null;
  const locationSourceMessage =
    Platform.OS !== 'android' || locationProvider === 'google-play-services'
      ? null
      : locationProvider === 'huawei-location-kit'
        ? language === 'russian'
          ? 'Источник геопозиции: Huawei Location Kit'
          : 'Location source: Huawei Location Kit'
        : locationProvider === 'android-location-manager'
          ? language === 'russian'
            ? 'Источник геопозиции: системный Android'
            : 'Location source: Android system provider'
          : null;
  const { cameraRef, defaultSettings, mapZoomLevel, zoomIn, zoomOut, centerOnPosition } = useActivityMapCamera({
    canRenderMap,
    currentPosition,
  });

  useEffect(() => {
    onLocationReadinessChange(canUseLocation);
  }, [canUseLocation, onLocationReadinessChange]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !canUseLocation) return;

    BatteryOptEnabled()
      .then((isEnabled: boolean) => {
        setIsBatteryOptimizationActive(isEnabled);
        setShouldRefreshPermissionStatus(false);
      })
      .catch((error: unknown) => errorToast('Не удалось проверить оптимизацию батареи', error));
  }, [canUseLocation, shouldRefreshPermissionStatus]);

  const onCenterOnCurrentLocation = useCallback(async () => {
    setIsCenteringOnCurrentLocation(true);
    try {
      const position = await getCurrentPositionAsync({ accuracy: 6 });
      dispatch(setLocationProvider(getLocationProvider(position)));
      centerOnPosition(position);
    } catch (error) {
      errorToast('Не удалось определить текущее местоположение', error);
    } finally {
      setIsCenteringOnCurrentLocation(false);
    }
  }, [centerOnPosition, dispatch]);

  return {
    canRenderMap,
    isLoadingLocationPrerequisites,
    isMapVisible,
    locationSourceMessage,
    mapViewProps: {
      currentPosition,
      cameraRef,
      cameraDefaultSettings: defaultSettings,
    },
    activityMapContext: {
      mapControls: {
        mapZoomLevel,
        isCenteringOnCurrentLocation,
        onZoomIn: zoomIn,
        onZoomOut: zoomOut,
        onCenterOnCurrentLocation,
      },
      locationPermissions: {
        isMapVisible,
        isLocationEnabled: isLocationServicesEnabled,
        foregroundPermissionStatus,
        backgroundPermissionStatus,
        setIsLocationEnabled: setIsLocationServicesEnabled,
        requestForegroundPermission,
        requestBackgroundPermission,
      },
      batteryOptimization: {
        isActive: isBatteryOptimizationActive,
        setIsNeedToRefreshPermission: setShouldRefreshPermissionStatus,
      },
    },
  };
}
