import type * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
import type * as AppShellModule from './app-shell';

const mockPathname = jest.fn(() => '/private-route');
const mockBottomSheetEnabled = jest.fn();
const mockNavigationBar = jest.fn();
const mockStackOptions = jest.fn();
let mockRouteName = 'home';
interface AppShellTestState {
  settings: { theme: 'dark' | 'light' | null; language: 'english' | 'russian' };
  auth: { accessToken: string | null; refreshToken: string | null };
}
const mockAppState: AppShellTestState = {
  settings: { theme: null, language: 'english' },
  auth: { accessToken: null, refreshToken: null },
};
const originalPlatformOS = Object.getOwnPropertyDescriptor(Platform, 'OS');

jest.mock('@R/typed-hooks', () => ({
  useAppSelector: (selector: (state: typeof mockAppState) => unknown) => selector(mockAppState),
}));

jest.mock('@U/hooks/use-app-initialization', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  interface MockStackOptions {
    headerLeft?: (props: { canGoBack: boolean; tintColor?: string }) => React.ReactNode;
    headerTitle?: (props: { children: React.ReactNode }) => React.ReactNode;
  }
  interface MockStackProps {
    children?: React.ReactNode;
    screenOptions: (props: { route: { name: string }; navigation: { goBack: () => void } }) => MockStackOptions;
  }
  const MockStack = ({ children, screenOptions }: MockStackProps) => {
    const options = screenOptions({ route: { name: mockRouteName }, navigation: { goBack: jest.fn() } });
    mockStackOptions(options);
    options.headerLeft?.({ canGoBack: false });
    options.headerLeft?.({ canGoBack: true, tintColor: 'white' });
    options.headerTitle?.({ children: 'Home' });
    return React.createElement(View, null, children);
  };
  const Stack = Object.assign(MockStack, { Screen: () => null });

  return {
    Stack,
    Redirect: ({ href }: { href: string }) =>
      React.createElement(View, { testID: 'app-shell-sign-in-redirect', accessibilityLabel: href }),
    usePathname: () => mockPathname(),
  };
});

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  return {
    ...actual,
    PaperProvider: ({
      children,
      settings,
    }: {
      children?: React.ReactNode;
      settings: {
        icon: (props: {
          name: string;
          color: string;
          size: number;
          direction: 'ltr' | 'rtl';
          testID?: string;
        }) => React.ReactNode;
      };
    }) => {
      settings.icon({ name: 'close', color: 'black', size: 18, direction: 'ltr' });
      settings.icon({ name: 'close', color: 'black', size: 18, direction: 'rtl' });
      return React.createElement(View, null, children);
    },
  };
});

jest.mock('react-native-gesture-handler', () => {
  const { View } = jest.requireActual('react-native');
  return { GestureHandlerRootView: View };
});

jest.mock('react-native-keyboard-controller', () => {
  const { View } = jest.requireActual('react-native');
  return { KeyboardProvider: View };
});

jest.mock('../bottom-sheet-provider/bottom-sheet-provider', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ children, enabled }: { children?: React.ReactNode; enabled: boolean }) => {
      mockBottomSheetEnabled(enabled);
      return React.createElement(View, null, children);
    },
  };
});

jest.mock('../navigation-bar/navigation-bar', () => ({
  __esModule: true,
  default: () => {
    mockNavigationBar();
    return null;
  },
}));

jest.mock('@Routes/notifications/notification-runtime/notification-runtime', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@Routes/notifications/push-token-runtime/push-token-runtime', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@Routes/subscription/subscription-status-sync/subscription-status-sync', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@Routes/watch-import/health-connect-auto-sync/health-connect-auto-sync', () => ({
  __esModule: true,
  default: () => null,
}));

const AppShell = require('./app-shell').default as typeof AppShellModule.default;

describe('AppShell', () => {
  beforeEach(() => {
    mockRouteName = 'home';
    mockPathname.mockReturnValue('/private-route');
    mockBottomSheetEnabled.mockClear();
    mockNavigationBar.mockClear();
    mockStackOptions.mockClear();
    mockAppState.settings.theme = null;
    mockAppState.settings.language = 'english';
    mockAppState.auth.accessToken = null;
    mockAppState.auth.refreshToken = null;
  });

  afterEach(() => {
    if (originalPlatformOS) Object.defineProperty(Platform, 'OS', originalPlatformOS);
  });

  it('redirects unauthenticated users from private routes to sign in', async () => {
    await render(<AppShell />);

    expect(screen.getByTestId('app-shell-sign-in-redirect')).toHaveProp('accessibilityLabel', `/${ROUTES.signIn}`);
  });

  it('keeps a refresh-token session on private routes and applies the Android shell', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockAppState.settings.theme = 'dark';
    mockAppState.auth.refreshToken = 'refresh-token';

    await render(<AppShell />);

    expect(screen.queryByTestId('app-shell-sign-in-redirect')).toBeNull();
    expect(mockBottomSheetEnabled).toHaveBeenCalledWith(true);
    expect(mockNavigationBar).toHaveBeenCalledTimes(1);
    expect(mockStackOptions).toHaveBeenCalled();
    expect(mockStackOptions).toHaveBeenCalledWith(expect.objectContaining({ headerBackVisible: false }));
  });

  it('uses the native map back button instead of the Android custom header button', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockAppState.auth.refreshToken = 'refresh-token';
    mockRouteName = `${ROUTES.map}/[id]`;

    await render(<AppShell />);

    expect(mockStackOptions).toHaveBeenCalledWith(
      expect.objectContaining({ headerBackVisible: undefined, headerLeft: undefined }),
    );
  });

  it('renders public routes without a session and uses the web header', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockAppState.settings.theme = 'light';
    mockAppState.settings.language = 'russian';
    mockPathname.mockReturnValue(`/${ROUTES.signIn}`);

    await render(<AppShell />);

    expect(screen.queryByTestId('app-shell-sign-in-redirect')).toBeNull();
    expect(mockBottomSheetEnabled).toHaveBeenCalledWith(false);
    expect(mockNavigationBar).not.toHaveBeenCalled();
    expect(mockStackOptions).toHaveBeenCalled();
  });
});
