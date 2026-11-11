import { IosAuthorizationStatus } from 'expo-notifications';
import { NOTIFICATION_COPY } from './constants';
import type { NotificationLocale } from './types';
import type { NotificationPermissionsStatus } from 'expo-notifications';

export function getExpoProjectId(expoProjectId?: string | null, easProjectId?: string | null) {
  return expoProjectId ?? easProjectId;
}

export function isNativeNotificationPlatform(platform: string) {
  return platform === 'android' || platform === 'ios';
}

export function isPhysicalPushDevice(platform: string, isDevice: boolean) {
  return isNativeNotificationPlatform(platform) && isDevice;
}

export function hasPushNotificationPermission(permission: NotificationPermissionsStatus, platform: string) {
  return (
    permission.granted ||
    (platform === 'ios' &&
      (permission.ios?.status === IosAuthorizationStatus.PROVISIONAL ||
        permission.ios?.status === IosAuthorizationStatus.EPHEMERAL))
  );
}

export function getPushChannelName(locale: NotificationLocale) {
  return NOTIFICATION_COPY[locale].pushChannel;
}
