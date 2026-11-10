import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import DateFilters from './date-filters';
import { MAPS_PAGE_COPY } from '../../const';

jest.mock('@expo/ui/swift-ui', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text, View } = jest.requireActual('react-native');
  return {
    Button: ({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) =>
      React.createElement(Pressable, { onPress, testID }, React.createElement(Text, null, label)),
    HStack: ({ children }: { children: ReactNode }) => React.createElement(View, null, children),
    Host: ({ children }: { children: ReactNode }) => React.createElement(View, null, children),
    Image: ({ systemName }: { systemName: string }) => React.createElement(Text, null, systemName),
    Menu: ({ children, label, testID }: { children: ReactNode; label: ReactNode; testID: string }) => {
      const [visible, setVisible] = React.useState(false);
      return React.createElement(
        View,
        null,
        React.createElement(Pressable, { testID, onPress: () => setVisible(true) }, label),
        visible ? children : null,
      );
    },
    Text: ({ children }: { children: ReactNode }) => React.createElement(Text, null, children),
  };
});
jest.mock('@expo/ui/swift-ui/modifiers', () => ({
  accessibilityLabel: (label: string) => ({ accessibilityLabel: label }),
  foregroundStyle: (color: string) => ({ color }),
}));

describe('date filters', () => {
  it('reports a selected month to the owner', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const copy = MAPS_PAGE_COPY[LANGUAGES.english];
    await renderWithProviders(
      <DateFilters
        filters={{ month: null, day: null, year: null }}
        availableFilters={{ months: [6], days: [14], years: [2026] }}
        copy={copy}
        locale="en-US"
        onChange={onChange}
      />,
    );

    await user.press(screen.getByTestId('month-filter'));
    await user.press(await screen.findByText('June'));

    expect(onChange).toHaveBeenCalledWith('month', 6);
  });
});
