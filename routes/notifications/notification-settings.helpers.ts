import { NOTIFICATION_COPY } from './constants';
import type { NotificationLocale } from './types';

export function getExpoProjectId(expoProjectId?: string | null, easProjectId?: string | null) {
  return expoProjectId ?? easProjectId;
}

export function isAndroidPhysicalDevice(platform: string, isDevice: boolean) {
  return platform === 'android' && isDevice;
}

export function getPushChannelName(locale: NotificationLocale) {
  return NOTIFICATION_COPY[locale].pushChannel;
}
