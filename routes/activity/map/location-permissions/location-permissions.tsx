import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Button, Icon, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import BackgroundLocationModal from '@Routes/activity/background-location-modal/background-location-modal';
import BackgroundLocationSwitcher from '@Routes/activity/background-location-switcher/background-location-switcher';
import ForegroundLocationSwitcher from '@Routes/activity/foregroud-location-switcher/foreground-location-switcher/foreground-location-switcher';
import LocationSettingsSwitcher from '@Routes/activity/location-settings-switcher/location-settings-switcher';
import { useActivityMapContext } from '../activity-map-context';
import { LOCATION_PERMISSIONS_TEXT } from './const';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function LocationPermissions() {
  const { colors } = useTheme();
  const {
    locationPermissions: {
      isMapVisible,
      isLocationEnabled,
      foregroundPermissionStatus,
      backgroundPermissionStatus,
      setIsLocationEnabled,
      requestForegroundPermission,
      requestBackgroundPermission,
    },
  } = useActivityMapContext();
  const backgroundLocationEnabledModalRef = useRef<BottomSheetModal>(null);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isProfileFilled, language } = useAppSelector(({ settings }) => settings);
  const copy = LOCATION_PERMISSIONS_TEXT[language];
  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isMapVisible && { height: '60%' }]}>
      {!isLocationEnabled ? (
        <LocationSettingsSwitcher isLocationEnabled={isLocationEnabled} setIsLocationEnabled={setIsLocationEnabled} />
      ) : null}
      {foregroundPermissionStatus && !foregroundPermissionStatus.granted ? (
        <ForegroundLocationSwitcher
          foregroundPermissionStatus={foregroundPermissionStatus}
          requestForegroundPermission={requestForegroundPermission}
        />
      ) : null}
      {foregroundPermissionStatus?.granted && !backgroundPermissionStatus?.granted ? (
        <BackgroundLocationSwitcher
          backgroundPermissionStatus={!!backgroundPermissionStatus?.granted}
          backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
        />
      ) : null}
      {!isProfileFilled && userId ? (
        <View
          style={[
            styles.profileNotice,
            { backgroundColor: colors.primaryContainer, borderColor: colors.outlineVariant },
          ]}>
          <View style={[styles.profileNoticeIcon, { backgroundColor: colors.primary }]}>
            <Icon source="account-alert-outline" size={24} color={colors.onPrimary} />
          </View>
          <View style={styles.profileNoticeContent}>
            <Text variant="titleSmall" style={{ color: colors.onPrimaryContainer }}>
              {copy.profileTitle}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.profileDescription}
            </Text>
            <Link
              testID="create-profile-link"
              href={`/${ROUTES.tabs}/${ROUTES.profile}/${ROUTES.profileSettings}`}
              asChild>
              <Button mode="contained-tonal" compact icon="account-plus-outline" style={styles.profileNoticeButton}>
                {copy.profileAction}
              </Button>
            </Link>
          </View>
        </View>
      ) : null}
      {!userId ? (
        <View
          testID="profile-check-error"
          style={[
            styles.profileNotice,
            { backgroundColor: colors.errorContainer, borderColor: colors.outlineVariant },
          ]}>
          <View style={[styles.profileNoticeIcon, { backgroundColor: colors.error }]}>
            <Icon source="cloud-alert-outline" size={24} color={colors.onError} />
          </View>
          <View style={styles.profileNoticeContent}>
            <Text variant="titleSmall" style={{ color: colors.onErrorContainer }}>
              {copy.profileErrorTitle}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.profileErrorDescription}
            </Text>
          </View>
        </View>
      ) : null}
      <BackgroundLocationModal
        backgroundLocationEnabledModalRef={backgroundLocationEnabledModalRef}
        requestBackgroundPermission={requestBackgroundPermission}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'stretch', flex: 1, justifyContent: 'center', padding: 16 },
  profileNotice: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    padding: 14,
  },
  profileNoticeIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  profileNoticeContent: { flex: 1, gap: 4 },
  profileNoticeButton: { alignSelf: 'flex-start', marginTop: 8 },
});
