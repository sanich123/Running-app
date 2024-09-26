import BackgroundLocationModal from '@C/activity/background-location-modal/background-location-modal';
import BackgroundLocationSwitcher from '@C/activity/background-location-switcher/background-location-switcher';
import BatteryOptimizationModal from '@C/activity/battery-optimization-modal/battery-optimization-modal';
import BatteryOptimizationSwitcher from '@C/activity/battery-optimization-switcher/battery-optimization-switcher';
import ForegroundLocationSwitcher from '@C/activity/foregroud-location-switcher/foreground-location-switcher';
import LocationSettingsSwitcher from '@C/activity/location-settings-switcher/location-settings-switcher';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { View } from 'react-native';
import { LocationPermissionsProps } from './types';

export default function LocationPermissions({
  setIsAppOptimizedByPhone,
  setIsNeedToRefreshPermission,
  isNeedToRefreshPermission,
  isMapVisible,
  isLocationEnabled,
  foregroundPermissionStatus,
  backgroundPermissionStatus,
  isAppOptimizedByPhone,
  setIsLocationEnabled,
  requestForegroundPermission,
  requestBackgroundPermission,
}: LocationPermissionsProps) {
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const batteryOptimizationEnabledModalRef = useRef<BottomSheetModal>(null);
  return (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }, isMapVisible && { height: '60%' }]}>
      {!isLocationEnabled && (
        <LocationSettingsSwitcher isLocationEnabled={isLocationEnabled} setIsLocationEnabled={setIsLocationEnabled} />
      )}
      {foregroundPermissionStatus && !foregroundPermissionStatus?.granted && (
        <ForegroundLocationSwitcher
          foregroundPermissionStatus={foregroundPermissionStatus}
          requestForegroundPermission={requestForegroundPermission}
        />
      )}
      {!backgroundPermissionStatus?.granted && (
        <BackgroundLocationSwitcher
          backgroundPermissionStatus={!!backgroundPermissionStatus?.granted}
          backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
        />
      )}
      {isAppOptimizedByPhone && (
        <BatteryOptimizationSwitcher
          isAppOptimizedByPhone={isAppOptimizedByPhone}
          setIsAppOptimizedByPhone={setIsAppOptimizedByPhone}
          batteryOptimizationEnabledModalRef={batteryOptimizationEnabledModalRef}
          setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
          isNeedToRefreshPermission={isNeedToRefreshPermission}
        />
      )}
      <BackgroundLocationModal
        backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
        requestBackgroundPermission={requestBackgroundPermission}
      />
      <BatteryOptimizationModal
        batteryOptimizationEnabledModalRef={batteryOptimizationEnabledModalRef}
        setIsNeedToRefreshPermission={setIsNeedToRefreshPermission}
      />
    </View>
  );
}
