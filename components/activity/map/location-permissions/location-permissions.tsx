import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import BackgroundLocationModal from '@C/activity/background-location-modal/background-location-modal';
import BackgroundLocationSwitcher from '@C/activity/background-location-switcher/background-location-switcher';
import ForegroundLocationSwitcher from '@C/activity/foregroud-location-switcher/foreground-location-switcher';
import LocationSettingsSwitcher from '@C/activity/location-settings-switcher/location-settings-switcher';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import type { LocationPermissionsProps } from '@C/activity/types';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function LocationPermissions({
  isMapVisible,
  isLocationEnabled,
  foregroundPermissionStatus,
  backgroundPermissionStatus,
  setIsLocationEnabled,
  requestForegroundPermission,
  requestBackgroundPermission,
}: LocationPermissionsProps) {
  const { colors } = useTheme();
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: profile, isSuccess } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isMapVisible && { height: '60%' }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'stretch', flex: 1, justifyContent: 'center', padding: 16 },
});
