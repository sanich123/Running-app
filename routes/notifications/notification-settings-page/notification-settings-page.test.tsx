import type { useEffect as useEffectType } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Alert, Linking, Platform } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { NOTIFICATION_COPY } from '../constants';
import NotificationSettingsPage from './notification-settings-page';

const originalPlatformOS = Object.getOwnPropertyDescriptor(Platform, 'OS');

jest.mock('expo-notifications', () => ({
  __esModule: true,
  AndroidImportance: { HIGH: 4 },
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, canAskAgain: true }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExpoPushToken[device-token]' }),
}));

const notificationMocks = jest.requireMock('expo-notifications') as {
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  setNotificationChannelAsync: jest.Mock;
  getExpoPushTokenAsync: jest.Mock;
};
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'project-1' } } }, easConfig: undefined },
}));
const mockDevice = jest.requireMock('expo-device') as { isDevice: boolean };
const mockExpoConstants = (
  jest.requireMock('expo-constants') as {
    default: { expoConfig: { extra: { eas: { projectId?: string } } }; easConfig?: { projectId?: string } };
  }
).default;
const mockErrorToast = (jest.requireMock('@S/error-toast/error-toast') as { errorToast: jest.Mock }).errorToast;
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const ReactRuntime = jest.requireActual('react') as { useEffect: typeof useEffectType };
    ReactRuntime.useEffect(callback, [callback]);
  },
}));

describe('NotificationSettingsPage', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockDevice.isDevice = true;
    mockExpoConstants.expoConfig.extra.eas.projectId = 'project-1';
    mockExpoConstants.easConfig = undefined;
    mockErrorToast.mockReset();
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setMockUserId('notification-owner'));
    notificationMocks.getPermissionsAsync.mockReset().mockResolvedValue({ granted: false, canAskAgain: true });
    notificationMocks.requestPermissionsAsync.mockReset().mockResolvedValue({ granted: true, canAskAgain: true });
    notificationMocks.setNotificationChannelAsync.mockReset().mockResolvedValue(undefined);
    notificationMocks.getExpoPushTokenAsync.mockReset().mockResolvedValue({ data: 'ExpoPushToken[device-token]' });
  });

  afterEach(() => {
    if (originalPlatformOS) Object.defineProperty(Platform, 'OS', originalPlatformOS);
  });

  it('requests permission only after tapping the button, then sends the Expo token to the server', async () => {
    let registrationBody: unknown;
    let profileUpdateBody: unknown;
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false })),
      http.post(`${BASE_URL}/notification/push-token`, async ({ request }) => {
        registrationBody = await request.json();
        return HttpResponse.json({ enabled: true });
      }),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () =>
        HttpResponse.json({ emailNotifications: false, pushNotifications: false }),
      ),
      http.patch(`${BASE_URL}/user/notification-owner/profile`, async ({ request }) => {
        profileUpdateBody = await request.json();
        return HttpResponse.json({ emailNotifications: false, pushNotifications: true });
      }),
    );

    await renderWithProviders(<NotificationSettingsPage />);
    const pushSwitch = await screen.findByTestId('pushNotificationsSwitch');
    expect(await screen.findByTestId('in-app-notifications-switch')).toBeOnTheScreen();
    expect(screen.getByTestId('email-notifications-switch')).toBeOnTheScreen();
    expect(screen.getByText(NOTIFICATION_COPY[LANGUAGES.russian].settingsIntro)).toBeOnTheScreen();
    await waitFor(() => expect(pushSwitch.props.accessibilityState.disabled).toBe(false));
    expect(notificationMocks.requestPermissionsAsync).not.toHaveBeenCalled();
    await fireEvent(pushSwitch, 'valueChange', true);
    await waitFor(() => expect(notificationMocks.setNotificationChannelAsync).toHaveBeenCalled());

    await waitFor(() =>
      expect(registrationBody).toEqual({ token: 'ExpoPushToken[device-token]', platform: 'android' }),
    );
    await waitFor(() => expect(profileUpdateBody).toEqual({ pushNotifications: true }));
    expect(notificationMocks.setNotificationChannelAsync).toHaveBeenCalledWith(
      'default',
      expect.objectContaining({ importance: 4 }),
    );
    expect(notificationMocks.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(notificationMocks.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'project-1' });
  });

  it('persists the in-app notification switch independently from push and email settings', async () => {
    let profile = { emailNotifications: false, pushNotifications: false, inAppNotifications: true };
    let updateBody: unknown;
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false })),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json(profile)),
      http.patch(`${BASE_URL}/user/notification-owner/profile`, async ({ request }) => {
        updateBody = await request.json();
        profile = { ...profile, ...(updateBody as { inAppNotifications: boolean }) };
        return HttpResponse.json(profile);
      }),
    );

    await renderWithProviders(<NotificationSettingsPage />);
    const inAppSwitch = await screen.findByTestId('in-app-notifications-switch');
    await fireEvent(inAppSwitch, 'valueChange', false);

    await waitFor(() => expect(updateBody).toEqual({ inAppNotifications: false }));
    expect(notificationMocks.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('persists the push preference separately and unregisters this device when disabled', async () => {
    let profile = { emailNotifications: false, pushNotifications: true, inAppNotifications: true };
    const updateBodies: unknown[] = [];
    let unregisterCalls = 0;
    notificationMocks.getPermissionsAsync.mockReset().mockResolvedValue({ granted: true, canAskAgain: true });
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: true })),
      http.delete(`${BASE_URL}/notification/push-token`, () => {
        unregisterCalls += 1;
        return HttpResponse.json({ enabled: false, updated: 1 });
      }),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json(profile)),
      http.patch(`${BASE_URL}/user/notification-owner/profile`, async ({ request }) => {
        const body = (await request.json()) as { pushNotifications: boolean };
        updateBodies.push(body);
        profile = { ...profile, ...body };
        return HttpResponse.json(profile);
      }),
    );

    await renderWithProviders(<NotificationSettingsPage />);
    const pushSwitch = await screen.findByTestId('pushNotificationsSwitch');
    await fireEvent(pushSwitch, 'valueChange', false);

    await waitFor(() => expect(updateBodies).toEqual([{ pushNotifications: false }]));
    await waitFor(() => expect(unregisterCalls).toBe(1));
  });

  it('shows the Android settings action when permission was permanently denied', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    notificationMocks.getPermissionsAsync.mockReset().mockResolvedValue({ granted: false, canAskAgain: true });
    notificationMocks.requestPermissionsAsync.mockReset().mockResolvedValue({ granted: false, canAskAgain: false });
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false })),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json({ emailNotifications: false })),
    );

    await renderWithProviders(<NotificationSettingsPage />);
    const pushSwitch = await screen.findByTestId('pushNotificationsSwitch');
    await waitFor(() => expect(pushSwitch.props.accessibilityState.disabled).toBe(false));
    await fireEvent(pushSwitch, 'valueChange', true);

    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Разрешение отключено',
        'Разрешите уведомления в настройках Android.',
        expect.any(Array),
      ),
    );
    const actions = alert.mock.calls[0][2];
    actions?.[1]?.onPress?.();
    expect(openSettings).toHaveBeenCalledTimes(1);
    expect(notificationMocks.getExpoPushTokenAsync).not.toHaveBeenCalled();
    alert.mockRestore();
    openSettings.mockRestore();
  });

  it('does not show a settings alert when permission can still be requested', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    notificationMocks.requestPermissionsAsync.mockReset().mockResolvedValue({ granted: false, canAskAgain: true });
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false })),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json({ emailNotifications: false })),
    );
    await renderWithProviders(<NotificationSettingsPage />);
    const pushSwitch = await screen.findByTestId('pushNotificationsSwitch');
    await waitFor(() => expect(pushSwitch.props.accessibilityState.disabled).toBe(false));
    await fireEvent(pushSwitch, 'valueChange', true);
    await waitFor(() => expect(notificationMocks.requestPermissionsAsync).toHaveBeenCalled());
    expect(alert).not.toHaveBeenCalled();
    alert.mockRestore();
  });

  it('uses the EAS project id fallback and reports an unavailable physical-device environment', async () => {
    mockExpoConstants.expoConfig.extra.eas.projectId = undefined;
    mockExpoConstants.easConfig = { projectId: 'fallback-project' };
    notificationMocks.getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false })),
      http.post(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: true })),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json({ emailNotifications: false })),
      http.patch(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json({ pushNotifications: true })),
    );
    await renderWithProviders(<NotificationSettingsPage />);
    const pushSwitch = await screen.findByTestId('pushNotificationsSwitch');
    await waitFor(() => expect(pushSwitch.props.accessibilityState.disabled).toBe(false));
    await fireEvent(pushSwitch, 'valueChange', true);
    await waitFor(() =>
      expect(notificationMocks.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'fallback-project' }),
    );
  });

  it('cleans up push registration when OS permission is revoked and handles profile-update failures', async () => {
    let unregisterCalls = 0;
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: true })),
      http.delete(`${BASE_URL}/notification/push-token`, () => {
        unregisterCalls += 1;
        return HttpResponse.json({ enabled: false, updated: 1 });
      }),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json({ emailNotifications: false })),
      http.patch(`${BASE_URL}/user/notification-owner/profile`, () => new HttpResponse(null, { status: 500 })),
    );
    notificationMocks.getPermissionsAsync.mockReset().mockResolvedValue({ granted: false, canAskAgain: true });
    await renderWithProviders(<NotificationSettingsPage />);
    await screen.findByTestId('in-app-notifications-switch');
    await waitFor(() => expect(unregisterCalls).toBe(1));
    await fireEvent(screen.getByTestId('in-app-notifications-switch'), 'valueChange', true);
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith('Не удалось изменить настройку уведомлений', expect.anything()),
    );
  });

  it('skips native permission checks on iOS', async () => {
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false })),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json({ emailNotifications: false })),
    );
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    await renderWithProviders(<NotificationSettingsPage />);
    await screen.findByTestId('pushNotificationsSwitch');
    expect(notificationMocks.getPermissionsAsync).not.toHaveBeenCalled();
    expect(screen.getByTestId('pushNotificationsSwitch').props.disabled).toBe(true);
  });

  it('surfaces a failed Android permission check', async () => {
    notificationMocks.getPermissionsAsync.mockReset().mockRejectedValue(new Error('permission service unavailable'));
    server.use(
      http.get(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false })),
      http.get(`${BASE_URL}/user/notification-owner/profile`, () => HttpResponse.json({ emailNotifications: false })),
    );
    await renderWithProviders(<NotificationSettingsPage />);
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith('Не удалось проверить разрешение на уведомления', expect.any(Error)),
    );
  });
});
