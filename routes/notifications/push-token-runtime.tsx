import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import { useRegisterPushTokenMutation, useUnregisterPushTokenMutation } from '@R/services/notifications/notifications';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByUserIdMutation } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { NOTIFICATION_PUSH_CONFIG } from './constants';
import { getNotificationLocale } from './helpers';
import { getExpoProjectId, getPushChannelName, isAndroidPhysicalDevice } from './notification-settings.helpers';

export default function PushTokenRuntime() {
  const userId = useAppSelector(({ auth }) => auth.userId);
  const language = useAppSelector(({ settings }) => settings.language);
  const locale = getNotificationLocale(language);
  const { data: profileInfo, refetch: refetchProfile } = useGetUserProfileByUserIdQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });
  const [registerToken] = useRegisterPushTokenMutation();
  const [unregisterToken] = useUnregisterPushTokenMutation();
  const [updateProfile] = useUpdateProfileByUserIdMutation();
  const syncing = useRef(false);
  const declinedPermissionUserId = useRef<string | null>(null);

  useEffect(() => {
    const syncPushToken = async (refreshProfile = false) => {
      if (!userId || !isAndroidPhysicalDevice(Platform.OS, Device.isDevice) || syncing.current) return;
      syncing.current = true;
      try {
        let shouldRegister = profileInfo?.pushNotifications === true;
        if (refreshProfile && shouldRegister) {
          const refreshedProfile = await refetchProfile();
          shouldRegister = refreshedProfile.data?.pushNotifications === true;
        }
        if (!shouldRegister) return;

        await Notifications.setNotificationChannelAsync(NOTIFICATION_PUSH_CONFIG.channelId, {
          name: getPushChannelName(locale),
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: NOTIFICATION_PUSH_CONFIG.vibrationPattern,
          lightColor: NOTIFICATION_PUSH_CONFIG.lightColor,
        });

        let permission = await Notifications.getPermissionsAsync();
        if (!permission.granted && declinedPermissionUserId.current !== userId) {
          permission = await Notifications.requestPermissionsAsync();
          if (!permission.granted) declinedPermissionUserId.current = userId;
        }
        if (!permission.granted) {
          await updateProfile({ body: { pushNotifications: false }, id: userId }).unwrap();
          await unregisterToken().unwrap();
          return;
        }
        declinedPermissionUserId.current = null;

        const projectId = getExpoProjectId(Constants.expoConfig?.extra?.eas?.projectId, Constants.easConfig?.projectId);
        if (!projectId) return;
        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        await registerToken({ token, platform: 'android' }).unwrap();
      } catch {
        // A failed refresh is retried on the next app foreground.
      } finally {
        syncing.current = false;
      }
    };

    void syncPushToken();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncPushToken(true);
    });
    return () => subscription.remove();
  }, [locale, profileInfo?.pushNotifications, refetchProfile, registerToken, unregisterToken, updateProfile, userId]);

  return null;
}
