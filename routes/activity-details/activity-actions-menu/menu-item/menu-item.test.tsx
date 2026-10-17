import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MenuItem from './menu-item';

jest.mock('@expo/ui/swift-ui', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text } = jest.requireActual('react-native');

  return {
    Button: ({ label, onPress, testID }: { label: string; onPress?: () => void; testID?: string }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress, testID },
        React.createElement(Text, null, label),
      ),
  };
});

describe('iOS activity menu item', () => {
  it('shows the action label and runs its callback', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <MenuItem action="delete" label="Delete workout" testID="delete-workout" onPress={onPress} />,
    );

    expect(screen.getByText('Delete workout')).toBeOnTheScreen();
    await user.press(screen.getByTestId('delete-workout'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
