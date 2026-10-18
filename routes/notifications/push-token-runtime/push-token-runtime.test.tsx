import { act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { AppState, Platform } from 'react-native';
import { runichApi } from '@R/runich-api/runich-api';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import PushTokenRuntime from './push-token-runtime';

let mockAppStateListener: ((state: 'active') => void) | undefined;

jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'project-1' } } }, easConfig: undefined },
}));
jest.mock('expo-notifications', () => ({
  __esModule: true,
  AndroidImportance: { HIGH: 4 },
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExpoPushToken[device-token]' }),
}));

const notificationMocks = jest.requireMock('expo-notifications') as {
  getPermissionsAsync: jest.Mock;
  setNotificationChannelAsync: jest.Mock;
  getExpoPushTokenAsync: jest.Mock;
};
const originalPlatformOS = Object.getOwnPropertyDescriptor(Platform, 'OS');

describe('PushTokenRuntime', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockAppStateListener = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      mockAppStateListener = listener as (state: 'active') => void;
      return { remove: jest.fn() };
    });
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId('push-owner'));
    notificationMocks.getPermissionsAsync.mockReset().mockResolvedValue({ granted: true });
    notificationMocks.setNotificationChannelAsync.mockReset().mockResolvedValue(undefined);
    notificationMocks.getExpoPushTokenAsync.mockReset().mockResolvedValue({ data: 'ExpoPushToken[device-token]' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalPlatformOS) Object.defineProperty(Platform, 'OS', originalPlatformOS);
  });

  it('retries token registration on foreground after a failed request for an enabled profile', async () => {
    let profileRequests = 0;
    let registrationRequests = 0;
    server.use(
      http.get(BASE_URL + '/user/push-owner/profile', () => {
        profileRequests += 1;
        return HttpResponse.json({ pushNotifications: true });
      }),
      http.post(BASE_URL + '/notification/push-token', () => {
        registrationRequests += 1;
        return registrationRequests === 1
          ? HttpResponse.json({ message: 'temporary failure' }, { status: 500 })
          : HttpResponse.json({ enabled: true });
      }),
    );
    const { unmount } = await renderWithProviders(<PushTokenRuntime />);

    await waitFor(() => expect(registrationRequests).toBe(1));
    expect(notificationMocks.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'project-1' });

    await act(async () => {
      mockAppStateListener?.('active');
    });
    await waitFor(() => expect(registrationRequests).toBe(2));
    expect(profileRequests).toBeGreaterThanOrEqual(2);

    unmount();
  });
});
