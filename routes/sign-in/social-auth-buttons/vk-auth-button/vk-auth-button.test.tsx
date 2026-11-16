import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { AppState, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LANGUAGES } from '@const/enums';
import { useLoginWithVkNativeMutation } from '@R/services/authentication/authentication';
import { errorToast } from '@S/error-toast/error-toast';
import { renderWithProviders } from '@T/utils/test-utils';
import { loginWithVkNative } from '../../../../modules/runich-auth/src/RunichAuth';
import { SOCIAL_AUTH_TEXT, VK_AUTH_URL } from '../../const';
import VkAuthButton from './vk-auth-button';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

jest.mock('@R/services/authentication/authentication', () => ({
  useLoginWithVkNativeMutation: jest.fn(),
}));

jest.mock('../../../../modules/runich-auth/src/RunichAuth', () => ({
  loginWithVkNative: jest.fn(),
}));

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

const mockLoginMutation = jest.fn();
const mockReplace = jest.fn();
const russianCopy = SOCIAL_AUTH_TEXT[LANGUAGES.russian];

describe('VkAuthButton', () => {
  const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    jest.mocked(useRouter).mockReturnValue({ replace: mockReplace } as never);
    jest.mocked(useLoginWithVkNativeMutation).mockReturnValue([mockLoginMutation] as never);
    mockLoginMutation.mockReturnValue({
      unwrap: jest
        .fn()
        .mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token', userId: 'user-id' }),
    });
  });

  afterEach(() => {
    if (originalPlatformDescriptor) Object.defineProperty(Platform, 'OS', originalPlatformDescriptor);
    jest.restoreAllMocks();
  });

  it('shows progress while opening VK and clears it after returning to the app', async () => {
    let resolveOpenURL: (() => void) | undefined;
    jest.spyOn(Linking, 'openURL').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveOpenURL = resolve;
        }),
    );
    const appStateListeners: ((nextAppState: string) => void)[] = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_eventType, listener) => {
      appStateListeners.push(listener as (nextAppState: string) => void);
      return { remove: jest.fn() };
    });

    await renderWithProviders(<VkAuthButton />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('vk-auth'));

    expect(Linking.openURL).toHaveBeenCalledWith(VK_AUTH_URL);
    await waitFor(() => expect(screen.getByTestId('vk-auth').props.accessibilityState.disabled).toBe(true));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByTestId('vk-auth-icon-container')).toBeNull();
    expect(screen.queryByText(russianCopy.vk)).toBeNull();

    expect(appStateListeners.length).toBeGreaterThan(0);
    await act(async () => {
      appStateListeners.forEach((listener) => listener('background'));
      await Promise.resolve();
      appStateListeners.forEach((listener) => listener('active'));
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());
    expect(screen.getByTestId('vk-auth').props.accessibilityState.disabled).toBe(false);
    resolveOpenURL?.();
  });

  it('clears loading and reports an external launch failure', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('launch failed'));

    await renderWithProviders(<VkAuthButton />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('vk-auth'));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith('Не удалось открыть VK', expect.any(Error)));
    expect(screen.getByTestId('vk-auth').props.accessibilityState.disabled).toBe(false);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('exchanges a native VK authorization and navigates after success on Android', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.mocked(loginWithVkNative).mockResolvedValue({
      code: 'authorization-code',
      deviceId: 'device-id',
      codeVerifier: 'verifier',
    });

    await renderWithProviders(<VkAuthButton />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('vk-auth'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(home)'));
    expect(mockLoginMutation).toHaveBeenCalledWith({
      code: 'authorization-code',
      deviceId: 'device-id',
      codeVerifier: 'verifier',
    });
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByTestId('vk-auth').props.accessibilityState.disabled).toBe(false);
  });

  it('clears native loading and reports an error when VK returns no authorization data', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.mocked(loginWithVkNative).mockResolvedValue(null);

    await renderWithProviders(<VkAuthButton />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('vk-auth'));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith('Не удалось войти через VK', expect.any(Error)));
    expect(mockLoginMutation).not.toHaveBeenCalled();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByTestId('vk-auth').props.accessibilityState.disabled).toBe(false);
  });
});
