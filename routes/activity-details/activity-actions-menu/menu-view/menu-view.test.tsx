import { Button } from '@expo/ui/swift-ui';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import MenuView from './menu-view';

jest.mock('@expo/ui/swift-ui', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text, View } = jest.requireActual('react-native');

  return {
    Button: ({ label, onPress, testID }: { label: string; onPress?: () => void; testID?: string }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button', onPress, testID },
        React.createElement(Text, null, label),
      ),
    Host: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    Menu: ({ children, label, testID }: { children: React.ReactNode; label: string; testID?: string }) =>
      React.createElement(View, { accessibilityLabel: label, testID }, children),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({ labelStyle: jest.fn() }));

describe('iOS workout actions menu', () => {
  it('shows the native menu trigger and calls the selected actions', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    await renderWithProviders(
      <MenuView accessibilityLabel="Workout actions">
        <Button label="Edit workout" testID="menu-view-child" onPress={onEdit} />
      </MenuView>,
    );

    expect(screen.getByLabelText('Workout actions')).toBeOnTheScreen();
    await user.press(screen.getByTestId('menu-view-child'));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
