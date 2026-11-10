import type React from 'react';
import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DateFilterMenu from './date-filter-menu';

jest.mock('@expo/ui/swift-ui', () => {
  const ReactModule = jest.requireActual('react') as typeof React;
  const {
    Pressable,
    Text: NativeText,
    View,
  } = jest.requireActual('react-native') as {
    Pressable: React.ComponentType<React.PropsWithChildren<{ onPress: () => void; testID: string }>>;
    Text: React.ComponentType<React.PropsWithChildren>;
    View: React.ComponentType<React.PropsWithChildren>;
  };
  return {
    Button: ({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) =>
      ReactModule.createElement(Pressable, { onPress, testID }, ReactModule.createElement(NativeText, null, label)),
    HStack: ({ children }: { children: ReactNode }) => ReactModule.createElement(View, null, children),
    Host: ({ children }: { children: ReactNode }) => ReactModule.createElement(View, null, children),
    Image: ({ systemName }: { systemName: string }) => ReactModule.createElement(NativeText, null, systemName),
    Menu: ({ children, label, testID }: { children: ReactNode; label: ReactNode; testID: string }) => {
      const [visible, setVisible] = ReactModule.useState(false);
      return ReactModule.createElement(
        View,
        null,
        ReactModule.createElement(Pressable, { onPress: () => setVisible(true), testID }, label),
        visible ? children : null,
      );
    },
    Text: ({ children }: { children: ReactNode }) => ReactModule.createElement(NativeText, null, children),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({
  accessibilityLabel: (label: string) => ({ accessibilityLabel: label }),
  foregroundStyle: (color: string) => ({ color }),
}));

describe('DateFilterMenu', () => {
  it('reports the selected date filter value', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await renderWithProviders(
      <DateFilterMenu
        triggerLabel="Year: All"
        accessibilityLabel="Year: All"
        testID="year-filter"
        options={[
          { label: 'All years', value: null },
          { label: '2026', value: 2026 },
        ]}
        selectedValue={null}
        onSelect={onSelect}
      />,
    );

    await user.press(screen.getByTestId('year-filter'));
    await user.press(await screen.findByTestId('year-filter-2026'));

    expect(onSelect).toHaveBeenCalledWith(2026);
  });
});
