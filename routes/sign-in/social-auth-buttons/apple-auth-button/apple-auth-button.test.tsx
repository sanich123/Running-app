import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LANGUAGES } from '@const/enums';
import { useLoginWithAppleNativeMutation } from '@R/services/authentication/authentication';
import { errorToast } from '@S/error-toast/error-toast';
import { renderWithProviders } from '@T/utils/test-utils';
import { SOCIAL_AUTH_TEXT } from '../../const';
import AppleAuthButton from './apple-auth-button';

jest.mock('expo-apple-authentication', () => {
  const { createElement } = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');

  return {
    isAvailableAsync: jest.fn(),
    signInAsync: jest.fn(),
    AppleAuthenticationScope: { FULL_NAME: 'FULL_NAME', EMAIL: 'EMAIL' },
    AppleAuthenticationButtonType: { SIGN_IN: 'SIGN_IN' },
    AppleAuthenticationButtonStyle: { BLACK: 'BLACK' },
    AppleAuthenticationUserDetectionStatus: { LIKELY_REAL: 2 },
    AppleAuthenticationButton: ({
      testID,
      onPress,
      pointerEvents,
      accessibilityState,
    }: {
      testID?: string;
      onPress: () => void;
      pointerEvents?: 'auto' | 'none';
      accessibilityState?: { disabled?: boolean };
    }) =>
      createElement(
        Pressable,
        { testID, onPress, pointerEvents, accessibilityState },
        createElement(Text, null, 'Apple'),
      ),
  };
});

jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper') as Record<string, unknown>;
  const { createElement } = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  return { ...actual, ActivityIndicator: ({ testID }: { testID?: string }) => createElement(View, { testID }) };
});

jest.mock('@R/services/authentication/authentication', () => ({
  useLoginWithAppleNativeMutation: jest.fn(),
}));

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

const mockLoginMutation = jest.fn();
const mockReplace = jest.fn();
const russianCopy = SOCIAL_AUTH_TEXT[LANGUAGES.russian];
const nonce = '01'.repeat(32);

describe('AppleAuthButton', () => {
  const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    jest.mocked(useRouter).mockReturnValue({ replace: mockReplace } as never);
    jest.mocked(AppleAuthentication.isAvailableAsync).mockResolvedValue(true);
    jest.mocked(AppleAuthentication.signInAsync).mockResolvedValue({
      authorizationCode: 'authorization-code',
      email: 'runner@example.com',
      fullName: {
        givenName: 'Alex',
        familyName: 'Runner',
        middleName: null,
        namePrefix: null,
        nameSuffix: null,
        nickname: null,
      },
      identityToken: 'apple-identity-token',
      realUserStatus: AppleAuthentication.AppleAuthenticationUserDetectionStatus.LIKELY_REAL,
      state: null,
      user: 'apple-user-id',
    });
    jest.mocked(Crypto.getRandomBytesAsync).mockResolvedValue(new Uint8Array(32).fill(1));
    jest.mocked(useLoginWithAppleNativeMutation).mockReturnValue([mockLoginMutation] as never);
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

  it('creates a nonce, shows progress, and finishes Apple sign-in', async () => {
    let resolveLogin: ((response: { accessToken: string; refreshToken: string; userId: string }) => void) | undefined;
    mockLoginMutation.mockReturnValue({
      unwrap: jest.fn(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve;
          }),
      ),
    });

    await renderWithProviders(<AppleAuthButton />);
    await waitFor(() => expect(screen.getByTestId('apple-auth')).toBeTruthy());
    const user = userEvent.setup();
    await user.press(screen.getByTestId('apple-auth'));

    await waitFor(() =>
      expect(mockLoginMutation).toHaveBeenCalledWith({
        authorizationCode: 'authorization-code',
        identityToken: 'apple-identity-token',
        nonce,
        givenName: 'Alex',
        familyName: 'Runner',
      }),
    );
    expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith({
      nonce,
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    expect(screen.getByText(`${russianCopy.signingInWith} ${russianCopy.apple}…`)).toBeTruthy();
    expect(screen.getByTestId('apple-auth').props.accessibilityState.disabled).toBe(true);

    await act(async () =>
      resolveLogin?.({ accessToken: 'access-token', refreshToken: 'refresh-token', userId: 'user-id' }),
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(home)'));
    expect(screen.queryByTestId('apple-auth-progress')).toBeNull();
  });

  it('hides the Apple button when sign-in is unavailable', async () => {
    jest.mocked(AppleAuthentication.isAvailableAsync).mockResolvedValue(false);

    await renderWithProviders(<AppleAuthButton />);

    await waitFor(() => expect(AppleAuthentication.isAvailableAsync).toHaveBeenCalled());
    expect(screen.queryByTestId('apple-auth')).toBeNull();
  });

  it('logs in returning Apple users when Apple omits first-time profile details', async () => {
    jest.mocked(AppleAuthentication.signInAsync).mockResolvedValueOnce({
      authorizationCode: 'authorization-code',
      email: null,
      fullName: null,
      identityToken: 'apple-identity-token',
      realUserStatus: AppleAuthentication.AppleAuthenticationUserDetectionStatus.LIKELY_REAL,
      state: null,
      user: 'apple-user-id',
    });

    await renderWithProviders(<AppleAuthButton />);
    await waitFor(() => expect(screen.getByTestId('apple-auth')).toBeTruthy());
    const user = userEvent.setup();
    await user.press(screen.getByTestId('apple-auth'));

    await waitFor(() =>
      expect(mockLoginMutation).toHaveBeenCalledWith({
        authorizationCode: 'authorization-code',
        identityToken: 'apple-identity-token',
        nonce,
        givenName: undefined,
        familyName: undefined,
      }),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)/(home)'));
  });

  it('does not show an error toast when the user cancels Apple sign-in', async () => {
    jest
      .mocked(AppleAuthentication.signInAsync)
      .mockRejectedValueOnce(Object.assign(new Error('cancelled'), { code: 'ERR_REQUEST_CANCELED' }));

    await renderWithProviders(<AppleAuthButton />);
    await waitFor(() => expect(screen.getByTestId('apple-auth')).toBeTruthy());
    const user = userEvent.setup();
    await user.press(screen.getByTestId('apple-auth'));

    await waitFor(() => expect(screen.queryByTestId('apple-auth-progress')).toBeNull());
    expect(errorToast).not.toHaveBeenCalled();
    expect(mockLoginMutation).not.toHaveBeenCalled();
  });

  it('reports a missing Apple identity token', async () => {
    jest.mocked(AppleAuthentication.signInAsync).mockResolvedValueOnce({
      authorizationCode: 'authorization-code',
      email: null,
      fullName: null,
      identityToken: null,
      realUserStatus: AppleAuthentication.AppleAuthenticationUserDetectionStatus.LIKELY_REAL,
      state: null,
      user: 'apple-user-id',
    });

    await renderWithProviders(<AppleAuthButton />);
    await waitFor(() => expect(screen.getByTestId('apple-auth')).toBeTruthy());
    const user = userEvent.setup();
    await user.press(screen.getByTestId('apple-auth'));

    await waitFor(() => expect(screen.queryByTestId('apple-auth-progress')).toBeNull());
    expect(errorToast).toHaveBeenCalledWith(russianCopy.appleLoginFailed);
    expect(mockLoginMutation).not.toHaveBeenCalled();
  });

  it('reports a missing Apple authorization code', async () => {
    jest.mocked(AppleAuthentication.signInAsync).mockResolvedValueOnce({
      authorizationCode: null,
      email: null,
      fullName: null,
      identityToken: 'apple-identity-token',
      realUserStatus: AppleAuthentication.AppleAuthenticationUserDetectionStatus.LIKELY_REAL,
      state: null,
      user: 'apple-user-id',
    });

    await renderWithProviders(<AppleAuthButton />);
    await waitFor(() => expect(screen.getByTestId('apple-auth')).toBeTruthy());
    const user = userEvent.setup();
    await user.press(screen.getByTestId('apple-auth'));

    await waitFor(() => expect(screen.queryByTestId('apple-auth-progress')).toBeNull());
    expect(errorToast).toHaveBeenCalledWith(russianCopy.appleLoginFailed);
    expect(mockLoginMutation).not.toHaveBeenCalled();
  });
});
