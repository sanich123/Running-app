import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import CustomTabBar from './custom-tab-bar';

jest.mock('expo-router', () => ({ usePathname: () => '/home' }));
jest.mock('@Routes/avatar/showable/showable', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="tab-avatar" />;
});

const state = {
  index: 0,
  routes: [
    { key: 'home-key', name: 'home' },
    { key: 'activity-key', name: 'activity', params: { source: 'tab' } },
  ],
};
const descriptors = {
  'home-key': { options: { tabBarTestID: 'home-tab', tabBarAccessibilityLabel: 'Home tab' } },
  'activity-key': { options: { tabBarTestID: 'activity-tab', tabBarAccessibilityLabel: 'Activity tab' } },
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
    expect(navigation.navigate).toHaveBeenCalledWith('activity', { source: 'tab' });
  });

  it('emits the tab long-press action', async () => {
    const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };
    await renderWithProviders(<CustomTabBar state={state} descriptors={descriptors} navigation={navigation} />);
    fireEvent(screen.getByTestId('activity-tab'), 'longPress');
    expect(navigation.emit).toHaveBeenCalledWith({ type: 'tabLongPress', target: 'activity-key' });
  });
});
