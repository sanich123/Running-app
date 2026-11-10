import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import Charts from './charts';
import { METRICS_TITLES } from './const';
import type { MonthMetrics } from './types';

jest.mock('./bar-chart-wrapper/bar-chart-wrapper', () => ({
  __esModule: true,
  default: ({ metricsArr, title }: { metricsArr: { value: number }[]; title: string }) => {
    const { Text } = require('react-native');
    return <Text testID="chart-data">{`${title}:${metricsArr?.[0]?.value}`}</Text>;
  },
}));
jest.mock('./choose-metrics-btns/choose-metrics-btns', () => ({
  __esModule: true,
  default: ({ setChartValue }: { setChartValue: (value: unknown) => void }) => {
    const { Button } = require('react-native');
    return <Button testID="choose-duration" title="duration" onPress={() => setChartValue('duration')} />;
  },
}));

describe('charts', () => {
  it('renders distance metrics and switches to the selected metric', async () => {
    await renderWithProviders(
      <Charts
        year={2025}
        months={[{ totalDistance: 8, totalDuration: 30, totalItems: 1 }] as unknown as MonthMetrics}
      />,
    );
    expect(screen.getByText(METRICS_TITLES[LANGUAGES.russian].distance)).toBeOnTheScreen();
    expect(screen.getByTestId('chart-data')).toHaveTextContent('Километры:8');

    await userEvent.press(screen.getByTestId('choose-duration'));
    expect(screen.getByText(METRICS_TITLES[LANGUAGES.russian].duration)).toBeOnTheScreen();
    expect(screen.getByTestId('chart-data')).toHaveTextContent('Время:30');
  });
});
