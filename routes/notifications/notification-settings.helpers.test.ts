import { getExpoProjectId, getPushChannelName, isAndroidPhysicalDevice } from './notification-settings.helpers';

describe('notification settings helpers', () => {
  it('prefers the Expo project id and falls back to EAS configuration', () => {
    expect(getExpoProjectId('expo-project', 'eas-project')).toBe('expo-project');
    expect(getExpoProjectId(undefined, 'eas-project')).toBe('eas-project');
    expect(getExpoProjectId(null, null)).toBeNull();
  });

  it('only enables push on a physical Android device', () => {
    expect(isAndroidPhysicalDevice('android', true)).toBe(true);
    expect(isAndroidPhysicalDevice('ios', true)).toBe(false);
    expect(isAndroidPhysicalDevice('android', false)).toBe(false);
  });

  it('localizes the Android push channel name', () => {
    expect(getPushChannelName('russian')).toBe('Уведомления');
    expect(getPushChannelName('english')).toBe('Notifications');
  });
});
