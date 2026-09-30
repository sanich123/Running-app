import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { DASHBOARD_LABELS, EMPTY_DASHBOARD_YEAR_DATA } from './const';
import DashboardHero from './dashboard-hero';
import type { DashboardMetric } from './types';

const labels = DASHBOARD_LABELS[LANGUAGES.russian];
const metricTotals = {
  distance: 12_345,
  duration: 7_200,
  activities: 6,
  steps: 8_500,
  caloriesActive: 550,
};

describe('dashboard hero', () => {
  it.each([
    ['distance', labels.distance, labels.kilometres],
    ['duration', labels.duration, labels.hours],
    ['activities', labels.activities, undefined],
    ['steps', labels.steps, labels.stepsUnit],
    ['caloriesActive', labels.calories, labels.kilocalories],
  ] as const)('shows the %s metric and its unit', async (metric, label, unit) => {
    await renderWithProviders(
      <DashboardHero
        metric={metric}
        metricTotals={metricTotals}
        activeDays={4}
        peakMonth="Май"
        labels={labels}
        onMetricChange={jest.fn()}
      />,
    );

    expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    if (unit) expect(screen.getByText(unit)).toBeOnTheScreen();
  });

  it('shows skeleton values while refreshing and defaults to the distance label', async () => {
    await renderWithProviders(
      <DashboardHero
        metric={'unknown' as DashboardMetric}
        metricTotals={EMPTY_DASHBOARD_YEAR_DATA.totals}
        activeDays={0}
        peakMonth="—"
        labels={labels}
        onMetricChange={jest.fn()}
        isRefreshing
      />,
    );

    expect(screen.getAllByText(labels.distance).length).toBeGreaterThan(0);
    expect(screen.queryByText(labels.kilometres)).toBeNull();
  });
});
