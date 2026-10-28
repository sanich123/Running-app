import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { setIsProfileFilled } from '@R/slices/settings/settings';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { makeLocationPermissionResponse } from '@T/utils/location-permission';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityMapContext from '../activity-map-context';
import LocationPermissions from './location-permissions';
import type { ActivityMapContextValue } from '../activity-map-context';
import type { LocationPermissionsProps } from '@Routes/activity/types';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  Link: ({ href, children, testID }: { href: string; children?: ReactNode; testID?: string }) => {
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
jest.mock(
  '@Routes/activity/foregroud-location-switcher/foreground-location-switcher/foreground-location-switcher',
  () => {
    const { View } = jest.requireActual('react-native');
    return () => <View testID="foreground-location-switcher" />;
  },
);
jest.mock('@Routes/activity/location-settings-switcher/location-settings-switcher', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View />;
});

const baseMapContext: Omit<ActivityMapContextValue, 'locationPermissions'> = {
  mapControls: {
    mapZoomLevel: 18,
    isCenteringOnCurrentLocation: false,
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onCenterOnCurrentLocation: jest.fn(),
  },
  batteryOptimization: { isActive: false, setIsNeedToRefreshPermission: jest.fn() },
};

async function renderLocationPermissions(locationPermissions: LocationPermissionsProps) {
  return renderWithProviders(
    <ActivityMapContext.Provider value={{ ...baseMapContext, locationPermissions }}>
      <LocationPermissions />
    </ActivityMapContext.Provider>,
  );
}

describe('location permissions', () => {
  it('shows the background permission prompt only after foreground permission is granted', async () => {
    const props = {
      isMapVisible: true,
      isLocationEnabled: true,
      foregroundPermissionStatus: makeLocationPermissionResponse(false),
      backgroundPermissionStatus: makeLocationPermissionResponse(false),
      setIsLocationEnabled: jest.fn(),
      requestForegroundPermission: jest.fn(),
      requestBackgroundPermission: jest.fn(),
    };
    await renderLocationPermissions(props);
    expect(screen.queryByTestId('background-location-switcher')).not.toBeOnTheScreen();

    await renderLocationPermissions({ ...props, foregroundPermissionStatus: makeLocationPermissionResponse(true) });
    expect(screen.getAllByTestId('background-location-switcher')).toHaveLength(1);
  });

  it('opens profile creation when recording is blocked by a missing profile', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    mockStore.dispatch(setIsProfileFilled(false));
    await renderLocationPermissions({
      isMapVisible: true,
      isLocationEnabled: true,
      foregroundPermissionStatus: makeLocationPermissionResponse(true),
      backgroundPermissionStatus: makeLocationPermissionResponse(true),
      setIsLocationEnabled: jest.fn(),
      requestForegroundPermission: jest.fn(),
      requestBackgroundPermission: jest.fn(),
    });
    const links = await screen.findAllByTestId('create-profile-link');
    await user.press(links[0]);
    expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.tabs}/${ROUTES.profile}/${ROUTES.profileSettings}`);
  });

  it('does not request the profile when the local profile flag is set', async () => {
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    mockStore.dispatch(setIsProfileFilled(true));
    await renderLocationPermissions({
      isMapVisible: true,
      isLocationEnabled: true,
      foregroundPermissionStatus: makeLocationPermissionResponse(true),
      backgroundPermissionStatus: makeLocationPermissionResponse(true),
      setIsLocationEnabled: jest.fn(),
      requestForegroundPermission: jest.fn(),
      requestBackgroundPermission: jest.fn(),
    });

    expect(screen.queryByTestId('create-profile-link')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('profile-check-error')).not.toBeOnTheScreen();
  });
});
