import type React from 'react';
import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityChartAxisMenu from './axis-selector-menu';

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
  disabled: (isDisabled: boolean) => ({ disabled: isDisabled }),
  foregroundStyle: (color: string) => ({ color }),
}));

describe('ActivityChartAxisMenu', () => {
  it('reports a selected metric from the menu', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await renderWithProviders(
      <ActivityChartAxisMenu
        side="left"
        axisLabel="Left axis"
        options={[
          { metric: 'pace', title: 'Pace', axisTitle: 'Pace', color: '#c40' },
          { metric: 'heartRate', title: 'Heart rate', axisTitle: 'Heart rate', color: '#48f' },
        ]}
        selectedMetric="pace"
        otherMetric="speed"
        onSelect={onSelect}
      />,
    );

    await user.press(screen.getByTestId('activity-chart-left-selector'));
    await user.press(await screen.findByTestId('activity-chart-left-metric-heartRate'));

    expect(onSelect).toHaveBeenCalledWith('heartRate');
  });
});
