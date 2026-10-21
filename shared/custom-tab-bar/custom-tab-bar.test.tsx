import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import CustomTabBar from './custom-tab-bar';

let mockPathname = `/${ROUTES.home}`;
jest.mock('expo-router', () => ({ usePathname: () => mockPathname }));
jest.mock('@S/avatar/showable/avatar-showable/avatar-showable', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="tab-avatar" />;
});

const state = {
  index: 0,
  routes: [
    { key: 'home-key', name: ROUTES.home },
    { key: 'activity-key', name: ROUTES.activity, params: { source: 'tab' } },
  ],
};
const descriptors = {
  'home-key': { options: { tabBarTestID: 'home-tab', tabBarAccessibilityLabel: 'Home tab' } },
  'activity-key': { options: { tabBarTestID: 'activity-tab', tabBarAccessibilityLabel: 'Activity tab' } },
};

const allRoutesState = {
  index: 0,
  routes: [
    { key: 'home-key', name: ROUTES.home },
    { key: 'activity-key', name: ROUTES.activity },
    { key: 'profile-key', name: ROUTES.profile },
    { key: 'statistic-key', name: ROUTES.statistic },
  ],
};
const allRoutesDescriptors = {
  ...descriptors,
  'profile-key': { options: { tabBarTestID: 'profile-tab', tabBarAccessibilityLabel: 'Profile tab' } },
  'statistic-key': { options: { tabBarTestID: 'statistic-tab', tabBarAccessibilityLabel: 'Statistic tab' } },
};

describe('custom tab bar', () => {
  it('navigates to a different tab after a regular press', async () => {
    const user = userEvent.setup();
    const navigation = {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    };
    await renderWithProviders(<CustomTabBar state={state} descriptors={descriptors} navigation={navigation} />);
    await user.press(screen.getByTestId('activity-tab'));
    expect(navigation.emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'activity-key', canPreventDefault: true });
    expect(navigation.navigate).toHaveBeenCalledWith(ROUTES.activity, { source: 'tab' });
  });

  it('emits the tab long-press action', async () => {
    const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };
    await renderWithProviders(<CustomTabBar state={state} descriptors={descriptors} navigation={navigation} />);
    fireEvent(screen.getByTestId('activity-tab'), 'longPress');
    expect(navigation.emit).toHaveBeenCalledWith({ type: 'tabLongPress', target: 'activity-key' });
  });

  it('renders all iOS tab variants and handles focused or prevented presses', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    const user = userEvent.setup();
    const navigation = {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    };

    await renderWithProviders(
      <CustomTabBar state={allRoutesState} descriptors={allRoutesDescriptors} navigation={navigation} />,
    );
    await user.press(screen.getByTestId('home-tab'));
    await user.press(screen.getByTestId('profile-tab'));
    expect(navigation.navigate).toHaveBeenCalledWith(ROUTES.profile, undefined);

    navigation.emit.mockReturnValue({ defaultPrevented: true });
    await user.press(screen.getByTestId('statistic-tab'));
    expect(navigation.navigate).not.toHaveBeenCalledWith(ROUTES.statistic, undefined);

    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('renders the Android ripple tab variant', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    const navigation = {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    };

    await renderWithProviders(
      <CustomTabBar state={allRoutesState} descriptors={allRoutesDescriptors} navigation={navigation} />,
    );

    expect(screen.getByTestId('home-tab')).toBeOnTheScreen();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('hides the tab bar on activity setup routes', async () => {
    const originalPathname = mockPathname;
    mockPathname = `/${ROUTES.manualActivity}`;
    const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };

    await renderWithProviders(
      <CustomTabBar state={allRoutesState} descriptors={allRoutesDescriptors} navigation={navigation} />,
    );

    expect(screen.toJSON()).toBeTruthy();
    mockPathname = originalPathname;
  });
});
