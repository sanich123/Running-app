import { createElement as mockCreateElement } from 'react';
import type React from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import TrackActionsMenu from './track-actions-menu';

jest.mock('@expo/ui/swift-ui', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native');
  return {
    Button: ({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) =>
      mockCreateElement(Pressable, { onPress, testID }, mockCreateElement(Text, null, label)),
    Host: ({ children }: { children: React.ReactNode }) => mockCreateElement(View, null, children),
    Label: ({ systemImage }: { systemImage: string }) => mockCreateElement(Text, null, systemImage),
    Menu: ({ children, label, testID }: { children: React.ReactNode; label: React.ReactNode; testID: string }) =>
      mockCreateElement(View, { testID }, label, children),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({ accessibilityLabel: (label: string) => label }));

describe('track actions menu', () => {
  it('calls the selected track action', async () => {
    const user = userEvent.setup();
    const onRename = jest.fn();
    await renderWithProviders(
      <TrackActionsMenu
        accessibilityLabel="Track actions"
        testID="track-actions"
        actions={[
          {
            label: 'Rename',
            testID: 'rename-track',
            leadingIcon: 'pencil-outline',
            systemImage: 'pencil',
            onPress: onRename,
          },
        ]}
      />,
    );

    await user.press(screen.getByTestId('rename-track'));

    expect(onRename).toHaveBeenCalledTimes(1);
  });
});
