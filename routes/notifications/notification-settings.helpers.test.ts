import { IosAuthorizationStatus } from 'expo-notifications';
import {
  getExpoProjectId,
  getPushChannelName,
  hasPushNotificationPermission,
  isNativeNotificationPlatform,
  isPhysicalPushDevice,
} from './notification-settings.helpers';

describe('notification settings helpers', () => {
  it('prefers the Expo project id and falls back to EAS configuration', () => {
    expect(getExpoProjectId('expo-project', 'eas-project')).toBe('expo-project');
    expect(getExpoProjectId(undefined, 'eas-project')).toBe('eas-project');
    expect(getExpoProjectId(null, null)).toBeNull();
  });

  it('supports native platforms only on physical devices', () => {
    expect(isNativeNotificationPlatform('android')).toBe(true);
    expect(isNativeNotificationPlatform('ios')).toBe(true);
    expect(isNativeNotificationPlatform('web')).toBe(false);
    expect(isPhysicalPushDevice('android', true)).toBe(true);
    expect(isPhysicalPushDevice('ios', true)).toBe(true);
    expect(isPhysicalPushDevice('ios', false)).toBe(false);
    expect(isPhysicalPushDevice('web', true)).toBe(false);
  });

  it('treats provisional iOS notification authorization as enabled', () => {
    expect(
      hasPushNotificationPermission(
        { granted: false, ios: { status: IosAuthorizationStatus.PROVISIONAL } } as never,
        'ios',
      ),
    ).toBe(true);
    expect(
      hasPushNotificationPermission(
        { granted: false, ios: { status: IosAuthorizationStatus.PROVISIONAL } } as never,
        'android',
      ),
    ).toBe(false);
  });

  it('localizes the Android push channel name', () => {
    expect(getPushChannelName('russian')).toBe('Уведомления');
    expect(getPushChannelName('english')).toBe('Notifications');
  });
});
