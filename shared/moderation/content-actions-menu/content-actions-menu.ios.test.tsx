import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ContentActionsMenu from './content-actions-menu.ios';

jest.mock('@expo/ui/swift-ui', () => {
  const React = jest.requireActual('react');
  const { Pressable: MockPressable, Text: MockText, View: MockView } = jest.requireActual('react-native');
  return {
    Button: ({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) =>
      React.createElement(MockPressable, { onPress, testID }, React.createElement(MockText, null, label)),
    Host: ({ children }: { children: React.ReactNode }) => React.createElement(MockView, null, children),
    Label: ({ systemImage }: { systemImage: string }) => React.createElement(MockText, null, systemImage),
    Menu: ({ children, label, testID }: { children: React.ReactNode; label: React.ReactNode; testID: string }) =>
      React.createElement(MockView, { testID }, label, children),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({ accessibilityLabel: (label: string) => label }));

describe('iOS ContentActionsMenu', () => {
  it('uses native menu actions for report and block', async () => {
    const user = userEvent.setup();
    const onReport = jest.fn();
    const onBlock = jest.fn();

    await renderWithProviders(
      <ContentActionsMenu
        accessibilityLabel="User actions"
        testID="ios-content-actions-menu"
        reportLabel="Report"
        reportTestID="ios-content-report"
        onReport={onReport}
        blockLabel="Block"
        blockTestID="ios-content-block"
        onBlock={onBlock}
      />,
    );

    expect(screen.getByTestId('ios-content-actions-menu')).toBeOnTheScreen();
    await user.press(screen.getByTestId('ios-content-report'));
    await user.press(screen.getByTestId('ios-content-block'));
    expect(onReport).toHaveBeenCalledTimes(1);
    expect(onBlock).toHaveBeenCalledTimes(1);
  });
});
