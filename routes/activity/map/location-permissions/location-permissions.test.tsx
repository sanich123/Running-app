import { screen, userEvent } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import LocationPermissions from './location-permissions';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  Link: ({ href, children, testID }: any) => {
    const { Pressable, Text } = jest.requireActual('react-native');
    return (
      <Pressable testID={testID} onPress={() => mockNavigate(href)}>
        <Text>{children}</Text>
      </Pressable>
    );
  },
}));
jest.mock('@Routes/activity/background-location-modal/background-location-modal', () => () => null);
jest.mock('@Routes/activity/background-location-switcher/background-location-switcher', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="background-location-switcher" />;
});
jest.mock('@Routes/activity/foregroud-location-switcher/foreground-location-switcher', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="foreground-location-switcher" />;
});
jest.mock('@Routes/activity/location-settings-switcher/location-settings-switcher', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View />;
});

describe('location permissions', () => {
  it('shows the background permission prompt only after foreground permission is granted', async () => {
    const props = {
      isMapVisible: true,
      isLocationEnabled: true,
      foregroundPermissionStatus: { granted: false } as any,
      backgroundPermissionStatus: { granted: false } as any,
      setIsLocationEnabled: jest.fn(),
      requestForegroundPermission: jest.fn(),
      requestBackgroundPermission: jest.fn(),
    };
    await renderWithProviders(<LocationPermissions {...props} />);
    expect(screen.queryByTestId('background-location-switcher')).not.toBeOnTheScreen();

    await renderWithProviders(
      <LocationPermissions {...props} foregroundPermissionStatus={{ granted: true } as any} />,
    );
    expect(screen.getAllByTestId('background-location-switcher')).toHaveLength(1);
  });

  it('opens profile creation when recording is blocked by a missing profile', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));
    server.use(http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () => HttpResponse.json(null)));
    await renderWithProviders(
      <LocationPermissions
        isMapVisible
        isLocationEnabled
        foregroundPermissionStatus={{ granted: true } as any}
        backgroundPermissionStatus={{ granted: true } as any}
        setIsLocationEnabled={jest.fn()}
        requestForegroundPermission={jest.fn()}
        requestBackgroundPermission={jest.fn()}
      />,
    );
    const links = await screen.findAllByTestId('create-profile-link');
    await user.press(links[0]);
    expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.tabs}/${ROUTES.profile}/${ROUTES.profileSettings}`);
  });

  it('explains when the profile cannot be checked', async () => {
    const userId = 'profile-check-fails';
    mockStore.dispatch(setUserId(userId));
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () =>
        HttpResponse.json({ message: 'server error' }, { status: 500 }),
      ),
    );

    await renderWithProviders(
      <LocationPermissions
        isMapVisible
        isLocationEnabled
        foregroundPermissionStatus={{ granted: true } as any}
        backgroundPermissionStatus={{ granted: true } as any}
        setIsLocationEnabled={jest.fn()}
        requestForegroundPermission={jest.fn()}
        requestBackgroundPermission={jest.fn()}
      />,
    );

    expect(await screen.findByTestId('profile-check-error')).toBeOnTheScreen();
    expect(screen.getByText('Не удалось проверить профиль')).toBeOnTheScreen();
    expect(screen.getByText(/Проверьте интернет/)).toBeOnTheScreen();
  });
});
