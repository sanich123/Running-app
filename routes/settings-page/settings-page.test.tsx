import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform, StyleSheet } from 'react-native';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import SettingsPage from './settings-page';

jest.mock('expo-device', () => ({
  manufacturer: null,
  modelName: null,
  osName: null,
  osVersion: null,
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('settings page', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    jest.clearAllMocks();
  });

  it('renders the settings actions in the scrollable page', async () => {
    await renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Язык')).toBeOnTheScreen();
    expect(screen.getByText('Удалить аккаунт')).toBeOnTheScreen();
    expect(screen.getByText('Выйти')).toBeOnTheScreen();
    expect(screen.getByText('О приложении')).toBeOnTheScreen();
    expect(screen.getByText(/Версия приложения: /)).toBeOnTheScreen();
    expect(screen.getByText(/Устройство: /)).toBeOnTheScreen();
    expect(screen.getByText(/Операционная система: /)).toBeOnTheScreen();

    const contentStyle = StyleSheet.flatten(screen.getByTestId('settings-page-scroll').props.contentContainerStyle);
    expect(contentStyle.paddingBottom).toBe(Platform.OS === 'web' ? 40 : 12);
  });

  it('hides the admin panel when the current user has no admin permission', async () => {
    server.use(
      http.get(BASE_URL + '/admin/access', () => HttpResponse.json({ roles: [], permissions: [], isSuperuser: false })),
    );

    await renderWithProviders(<SettingsPage />);

    await waitFor(() => expect(screen.queryByTestId('admin-panel-settings-row')).toBeNull());
  });

  it('opens the admin panel for a user with an admin permission', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(BASE_URL + '/admin/access', () =>
        HttpResponse.json({ roles: ['moderator'], permissions: ['moderation.manage'], isSuperuser: false }),
      ),
    );

    await renderWithProviders(<SettingsPage />);
    await user.press(await screen.findByTestId('admin-panel-settings-row'));

    expect(mockPush).toHaveBeenCalledWith('/' + ROUTES.admin);
  });

  it('uses browser labels and wide-page spacing on web', async () => {
    const originalOS = Platform.OS;
    const dimensions = jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: MAX_MOBILE_WIDTH,
      height: 800,
      scale: 1,
      fontScale: 1,
    });
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    try {
      await renderWithProviders(<SettingsPage />);

      const contentStyle = StyleSheet.flatten(screen.getByTestId('settings-page-scroll').props.contentContainerStyle);
      expect(contentStyle.paddingBottom).toBe(40);
      expect(contentStyle.width).toBe(MAX_MOBILE_WIDTH);
      expect(contentStyle.marginHorizontal).toBe('auto');
      expect(screen.getByText(/Устройство: Веб-браузер/)).toBeOnTheScreen();
      expect(screen.getByText(/Операционная система: Неизвестно/)).toBeOnTheScreen();
    } finally {
      dimensions.mockRestore();
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });
});
