import BackgroundLocationModal from '@C/activity/background-location-modal/background-location-modal';
import BackgroundLocationSwitcher from '@C/activity/background-location-switcher/background-location-switcher';
import BatteryOptimizationModal from '@C/activity/battery-optimization-modal/battery-optimization-modal';
import BatteryOptimizationSwitcher from '@C/activity/battery-optimization-switcher/battery-optimization-switcher';
import ForegroundLocationSwitcher from '@C/activity/foregroud-location-switcher/foreground-location-switcher';
import LocationSettingsSwitcher from '@C/activity/location-settings-switcher/location-settings-switcher';
import { LocationPermissionsProps } from '@C/activity/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { Link } from 'expo-router';
import { useRef } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

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
  const { colors } = useTheme();
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const batteryOptimizationEnabledModalRef = useRef<BottomSheetModal>(null);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: profile, isSuccess } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  return (
    <View
      style={[
        { flex: 1, justifyContent: 'center', alignItems: 'flex-end', backgroundColor: colors.background },
        isMapVisible && { height: '60%' },
      ]}>
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
      {isSuccess && !profile && (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
          <Text variant="bodyMedium" style={{ textAlign: 'justify' }}>
            Вы зарегистрированы, но у вас нет профиля пользователя. Для того, чтобы записывать и сохранять активности,
            надо добавить имя и фотографию
          </Text>
          <Link href="/(protected)/(tabs)/profile/profile-settings" style={{ marginTop: 10 }}>
            Перейти и создать профиль пользователя
          </Link>
        </View>
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
