import { screen, userEvent } from '@testing-library/react-native';
import { processColor } from 'react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityTimeChart from './activity-time-chart';
import { HOME_ACTIVITY_FULL_VIEW } from '../../metrics/const';
import { ACTIVITY_CHART_METRIC_COLORS, HEART_RATE_ZONE_COLORS } from '../utils';
import type { ActivityChartSeries } from '../types';

const zoneSettings = { basis: 'activityMaximum' as const, maximumHeartRate: 150 };

const chartSeries: ActivityChartSeries[] = [
  {
    metric: 'heartRate',
    minValue: 100,
    maxValue: 140,
    data: [
      { originalValue: 100, elapsedMilliseconds: 0, label: '00:00' },
      { originalValue: 120, elapsedMilliseconds: 30_000 },
      { originalValue: 140, elapsedMilliseconds: 60_000, label: '01:00' },
    ],
  },
  {
    metric: 'pace',
    minValue: 300,
    maxValue: 360,
    data: [
      { originalValue: 330, elapsedMilliseconds: 0, label: '00:00' },
      { originalValue: 300, elapsedMilliseconds: 30_000 },
      { originalValue: 360, elapsedMilliseconds: 60_000, label: '01:00' },
    ],
  },
  {
    metric: 'elevation',
    minValue: 80,
    maxValue: 120,
    data: [
      { originalValue: 80, elapsedMilliseconds: 0, label: '00:00' },
      { originalValue: 100, elapsedMilliseconds: 30_000 },
      { originalValue: 120, elapsedMilliseconds: 60_000, label: '01:00' },
    ],
  },
];

describe('ActivityTimeChart', () => {
  const labels = HOME_ACTIVITY_FULL_VIEW[LANGUAGES.english];

  beforeEach(() => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('lets the user choose a different metric for each axis', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <ActivityTimeChart chartSeries={chartSeries} zoneSettings={zoneSettings} language={LANGUAGES.english} />,
      { store: mockStore },
    );

    expect(screen.getByLabelText(`${labels.chartLeftAxis}: ${labels.heartRateAxisLabel}`)).toBeOnTheScreen();
    expect(screen.getByLabelText(`${labels.chartRightAxis}: ${labels.paceAxisLabel}`)).toBeOnTheScreen();
    expect(screen.queryByText(labels.chartLeftAxis)).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.chartRightAxis)).not.toBeOnTheScreen();
    expect(screen.getByTestId('activity-chart-right-selector')).toHaveStyle({ alignItems: 'flex-end' });
    expect(screen.getByTestId('activity-chart-right-value')).toHaveStyle({
      justifyContent: 'flex-end',
      width: '100%',
    });
    expect(screen.getByTestId('activity-chart-right-label')).toHaveStyle({ flexShrink: 1 });

    await user.press(screen.getByTestId('activity-chart-right-selector'));
    await user.press(screen.getByTestId('activity-chart-right-metric-elevation'));

    expect(screen.getByLabelText(`${labels.chartRightAxis}: ${labels.elevationAxisLabel}`)).toBeOnTheScreen();
    expect(screen.getByTestId('activity-chart-series-elevation')).toBeOnTheScreen();
  });

  it('disables the metric used by the other axis', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <ActivityTimeChart chartSeries={chartSeries} zoneSettings={zoneSettings} language={LANGUAGES.english} />,
      { store: mockStore },
    );

    await user.press(screen.getByTestId('activity-chart-left-selector'));

    expect(screen.getByTestId('activity-chart-left-metric-pace')).toBeDisabled();
    expect(screen.getByTestId('activity-chart-left-metric-heartRate')).not.toBeDisabled();
    await user.press(screen.getByTestId('activity-chart-left-metric-heartRate'));
  });

  it('shows only metrics available in the workout data', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <ActivityTimeChart chartSeries={[chartSeries[0]]} zoneSettings={zoneSettings} language={LANGUAGES.english} />,
      { store: mockStore },
    );

    await user.press(screen.getByTestId('activity-chart-left-selector'));

    expect(screen.getByTestId('activity-chart-left-metric-heartRate')).toBeOnTheScreen();
    expect(screen.queryByTestId('activity-chart-left-metric-elevation')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-chart-right-selector')).not.toBeOnTheScreen();
    await user.press(screen.getByTestId('activity-chart-left-metric-heartRate'));
  });

  it('uses distinct colors for pace and elevation outside the heart-rate zone palette', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <ActivityTimeChart chartSeries={chartSeries} zoneSettings={zoneSettings} language={LANGUAGES.english} />,
      { store: mockStore },
    );

    const paceSeries = screen.getByTestId('activity-chart-series-pace');
    const paceStroke = paceSeries.props.stroke as { payload: number };
    expect(paceStroke.payload).toBe(processColor(ACTIVITY_CHART_METRIC_COLORS.pace));
    expect(HEART_RATE_ZONE_COLORS.map(processColor)).not.toContain(paceStroke.payload);

    await user.press(screen.getByTestId('activity-chart-right-selector'));
    await user.press(screen.getByTestId('activity-chart-right-metric-elevation'));

    const elevationSeries = screen.getByTestId('activity-chart-series-elevation');
    const elevationStroke = elevationSeries.props.stroke as { payload: number };
    expect(elevationStroke.payload).toBe(processColor(ACTIVITY_CHART_METRIC_COLORS.elevation));
    expect(HEART_RATE_ZONE_COLORS).not.toContain(elevationSeries.props.stroke);
    expect(elevationSeries.props.stroke).not.toBe(paceSeries.props.stroke);
  });
});
