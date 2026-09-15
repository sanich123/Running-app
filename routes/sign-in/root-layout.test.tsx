import { screen } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { store } from '@R/store';
import { renderWithProviders } from '@T/utils/test-utils';
import RootLayout from '../../app/_layout';

let mockPathname = `/${ROUTES.settings}`;

jest.mock('@expo-google-fonts/plus-jakarta-sans', () => ({
  PlusJakartaSans_400Regular: 'regular',
  PlusJakartaSans_500Medium: 'medium',
  PlusJakartaSans_600SemiBold: 'semi-bold',
  PlusJakartaSans_800ExtraBold: 'extra-bold',
  useFonts: () => [true],
}));
jest.mock('@U/hooks/use-app-initialization', () => jest.fn());
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
  setOptions: jest.fn(),
}));
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('expo-router', () => {
  const { Text, View } = jest.requireActual('react-native');
  const Screen = () => null;
  const Stack = Object.assign(({ children }: { children: React.ReactNode }) => <View>{children}</View>, { Screen });
  return {
    Redirect: ({ href }: { href: string }) => (
      <View testID="root-redirect">
        <Text>{href}</Text>
      </View>
    ),
    Stack,
    useGlobalSearchParams: () => ({}),
    usePathname: () => mockPathname,
  };
});

describe('RootLayout navigation', () => {
  it('redirects unauthenticated users to sign in from a private route', async () => {
    store.dispatch(resetAuthSlice());
    mockPathname = `/${ROUTES.settings}`;
    await renderWithProviders(<RootLayout />);
    expect(screen.getByTestId('root-redirect')).toBeOnTheScreen();
    expect(screen.getByText(`/${ROUTES.signIn}`)).toBeOnTheScreen();
  });
});
