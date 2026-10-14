import { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  useGetPushTokenStatusQuery,
  useRegisterPushTokenMutation,
  useUnregisterPushTokenMutation,
} from '@R/services/notifications/notifications';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { NOTIFICATION_COPY, NOTIFICATION_PUSH_CONFIG } from './constants';
import { getNotificationLocale } from './helpers';
import { getExpoProjectId, getPushChannelName, isAndroidPhysicalDevice } from './notification-settings.helpers';

export function useNotificationSettings() {
  const language = useAppSelector(({ settings }) => settings.language);
  const userId = useAppSelector(({ auth }) => auth.userId);
  const locale = getNotificationLocale(language);
  const copy = NOTIFICATION_COPY[locale];
  const { data: profileInfo, isSuccess: isProfileLoaded } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile, { isLoading: isUpdatingInAppPreference }] = useUpdateProfileByUserIdMutation();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isRequestingPush, setIsRequestingPush] = useState(false);
  const { data: pushStatus, isLoading: isStatusLoading } = useGetPushTokenStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [registerToken, { isLoading: isRegistering }] = useRegisterPushTokenMutation();
  const [unregisterToken, { isLoading: isUnregistering }] = useUnregisterPushTokenMutation();
  const inAppNotificationsEnabled = profileInfo?.inAppNotifications !== false;
  const canUpdateProfilePreferences = Boolean(userId && isProfileLoaded);
  const busy = isStatusLoading || isRegistering || isUnregistering || isRequestingPush;

  const toggleInAppNotifications = async (enabled: boolean) => {
    try {
      await updateProfile({ body: { inAppNotifications: enabled }, id: userId }).unwrap();
    } catch (error) {
      errorToast(copy.updateSettingError, error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (Platform.OS !== 'android') {
        setPermissionChecked(true);
        return () => {
          active = false;
        };
      }
      void Notifications.getPermissionsAsync()
        .then(async (permission) => {
          if (!active) return;
          setPermissionChecked(true);
          if (!permission.granted && pushStatus?.enabled) {
            try {
              await unregisterToken().unwrap();
            } catch (error) {
              errorToast(copy.disablePushError, error);
            }
          }
        })
        .catch((error: unknown) => {
          if (active) {
            setPermissionChecked(true);
            errorToast(copy.checkPermissionError, error);
          }
        });
      return () => {
        active = false;
      };
    }, [copy, pushStatus?.enabled, unregisterToken]),
  );

  const enablePush = async () => {
    if (!isAndroidPhysicalDevice(Platform.OS, Device.isDevice)) {
      errorToast(copy.pushUnavailable);
      return;
    }
    try {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_PUSH_CONFIG.channelId, {
        name: getPushChannelName(locale),
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: NOTIFICATION_PUSH_CONFIG.vibrationPattern,
        lightColor: NOTIFICATION_PUSH_CONFIG.lightColor,
      });
      let permission = await Notifications.getPermissionsAsync();
      if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
      setPermissionChecked(true);
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(copy.permissionTitle, copy.permissionBody, [
            { text: copy.notNow, style: 'cancel' },
            { text: copy.openSettings, onPress: () => void Linking.openSettings() },
          ]);
        }
        return;
      }
      const projectId = getExpoProjectId(Constants.expoConfig?.extra?.eas?.projectId, Constants.easConfig?.projectId);
      if (!projectId) throw new Error(copy.missingProjectId);
      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      await registerToken({ token, platform: 'android' }).unwrap();
    } catch (error) {
      errorToast(copy.enablePushError, error);
    }
  };

  const togglePush = async () => {
    try {
      if (pushStatus?.enabled) await unregisterToken().unwrap();
      else {
        setIsRequestingPush(true);
        try {
          await enablePush();
        } finally {
          setIsRequestingPush(false);
        }
      }
    } catch (error) {
      errorToast(copy.updatePushError, error);
    }
  };

  return {
    busy,
    copy,
    canUpdateProfilePreferences,
    inAppNotificationsEnabled,
    isRegistering,
    isRequestingPush,
    isStatusLoading,
    isUnregistering,
    isUpdatingInAppPreference,
    permissionChecked,
    pushEnabled: Boolean(pushStatus?.enabled),
    toggleInAppNotifications,
    togglePush,
  };
}
