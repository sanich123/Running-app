import { render, screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import type * as AppShellModule from './app-shell';

const mockPathname = jest.fn(() => '/private-route');
const mockAppState = {
  settings: { theme: null, language: 'english' },
  auth: { accessToken: null, refreshToken: null },
};

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
  return {
    Stack: { Screen: () => null },
    Redirect: ({ href }: { href: string }) =>
      React.createElement(View, { testID: 'app-shell-sign-in-redirect', accessibilityLabel: href }),
    usePathname: () => mockPathname(),
  };
});

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
  it('redirects unauthenticated users from private routes to sign in', async () => {
    await render(<AppShell />);

    expect(screen.getByTestId('app-shell-sign-in-redirect')).toHaveProp('accessibilityLabel', `/${ROUTES.signIn}`);
  });
});
