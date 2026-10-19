import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityChart from './activity-chart';
import { HOME_ACTIVITY_FULL_VIEW } from '../metrics/const';
import type { ActivityChartDataResponse } from '@R/runich-api/types';

const mockUseGetActivityChartDataQuery = jest.fn();
jest.mock('@R/services/activity/activity', () => ({
  ...jest.requireActual('@R/services/activity/activity'),
  useGetActivityChartDataQuery: (...args: unknown[]) => mockUseGetActivityChartDataQuery(...args),
}));
jest.mock('@S/error-component/error-component', () => {
  const { Pressable } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ refetch }: { refetch: () => void }) => <Pressable testID="activity-chart-retry" onPress={refetch} />,
  };
});

const chartData: ActivityChartDataResponse = {
  locations: [
    { timestamp: 1_000, coords: { latitude: 0, longitude: 0, altitude: 100, timestamp: 1_000 } },
    { timestamp: 121_000, coords: { latitude: 0, longitude: 0.005, altitude: 110, timestamp: 121_000 } },
    { timestamp: 241_000, coords: { latitude: 0, longitude: 0.01, altitude: 120, timestamp: 241_000 } },
  ],
  heartRateSamples: [
    { timestamp: 1_000, beatsPerMinute: 110 },
    { timestamp: 121_000, beatsPerMinute: 130 },
    { timestamp: 241_000, beatsPerMinute: 150 },
  ],
};

describe('ActivityChart', () => {
  const labels = HOME_ACTIVITY_FULL_VIEW[LANGUAGES.russian];

  beforeEach(() => {
    mockStore.dispatch(setMockUserId('viewer-1'));
    mockUseGetActivityChartDataQuery.mockReset();
  });

  it('shows the loading state while chart data is being fetched', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({ isLoading: true });

    await renderWithProviders(<ActivityChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(screen.getByText(labels.chartLoading)).toBeOnTheScreen();
    expect(screen.queryByTestId('activity-chart-plot')).not.toBeOnTheScreen();
  });

  it('lets the user retry after a chart request fails', async () => {
    const refetch = jest.fn();
    mockUseGetActivityChartDataQuery.mockReturnValue({ error: { status: 'CUSTOM_ERROR' }, refetch });

    await renderWithProviders(<ActivityChart activityId="activity-1" activityDistance={1_112} sport="run" />);
    fireEvent.press(screen.getByTestId('activity-chart-retry'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when there is not enough chart data', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({
      data: { ...chartData, locations: [] },
      isLoading: false,
    });

    await renderWithProviders(<ActivityChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(screen.queryByTestId('activity-chart-plot')).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.graphTitle)).not.toBeOnTheScreen();
  });

  it('shows the chart and its time labels when data is available', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({ data: chartData, isLoading: false });

    await renderWithProviders(<ActivityChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(mockUseGetActivityChartDataQuery).toHaveBeenCalledWith(
      { activityId: 'activity-1', viewerId: 'viewer-1' },
      { skip: false },
    );
    expect(screen.getByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(screen.getByText(labels.graphTitle)).toBeOnTheScreen();
    expect(screen.getAllByText('00:00').length).toBeGreaterThan(0);
    expect(screen.getByText(labels.heartRateZonesTitle)).toBeOnTheScreen();
    expect(screen.getByText(labels.heartRateZonesActivityHint(150))).toBeOnTheScreen();
    expect(screen.getByText('≤ 89')).toBeOnTheScreen();
    expect(screen.getByText('90–104')).toBeOnTheScreen();
    expect(screen.getByText('105–119')).toBeOnTheScreen();
    expect(screen.getByText('120–134')).toBeOnTheScreen();
    expect(screen.getByText('≥ 135')).toBeOnTheScreen();
  });

  it('uses profile heart-rate reserve settings before age and workout defaults', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({ data: chartData, isLoading: false });

    await renderWithProviders(
      <ActivityChart
        activityId="activity-1"
        activityDistance={1_112}
        sport="run"
        profileAge="40"
        profileRestingHeartRate="55"
        profileMaximumHeartRate="190"
      />,
    );

    expect(screen.getByText(labels.heartRateZonesProfileHint(55, 190))).toBeOnTheScreen();
    expect(screen.getByText('≤ 135')).toBeOnTheScreen();
  });

  it('shows route metrics when the activity has no heart-rate samples', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({
      data: { ...chartData, heartRateSamples: [] },
      isLoading: false,
    });

    await renderWithProviders(<ActivityChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(screen.getByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(screen.getByText(labels.elevationAxisLabel)).toBeOnTheScreen();
    expect(screen.queryByText(labels.heartRateZonesTitle)).not.toBeOnTheScreen();
  });

  it('keeps the heart-rate chart available when route points cannot produce a speed series', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({
      data: {
        ...chartData,
        locations:
          chartData.locations?.map((location) => ({
            ...location,
            coords: { ...location.coords, longitude: 0 },
          })) ?? [],
      },
      isLoading: false,
    });

    await renderWithProviders(<ActivityChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(screen.getByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(screen.getByText(labels.heartRateAxisLabel)).toBeOnTheScreen();
    expect(screen.queryByText(labels.paceAxisLabel)).not.toBeOnTheScreen();
  });

  it('hides heart-rate data when the activity owner has restricted it', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({ data: chartData, isLoading: false });

    await renderWithProviders(
      <ActivityChart activityId="activity-1" activityDistance={1_112} sport="run" canViewHeartRate={false} />,
    );

    expect(screen.getByTestId('activity-chart-plot')).toBeOnTheScreen();
    expect(screen.queryByText(labels.heartRateZonesTitle)).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.heartRateAxisLabel)).not.toBeOnTheScreen();
    expect(screen.getByText(labels.paceAxisLabel)).toBeOnTheScreen();
    expect(screen.getByText(labels.elevationAxisLabel)).toBeOnTheScreen();
  });

  it('hides the chart when only one metric is allowed', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({ data: chartData, isLoading: false });

    await renderWithProviders(
      <ActivityChart
        activityId="activity-1"
        activityDistance={1_112}
        sport="run"
        canViewHeartRate={false}
        canViewElevation={false}
      />,
    );

    expect(screen.queryByTestId('activity-chart-plot')).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.graphTitle)).not.toBeOnTheScreen();
    expect(mockUseGetActivityChartDataQuery).toHaveBeenCalledWith(
      { activityId: 'activity-1', viewerId: 'viewer-1' },
      { skip: true },
    );
  });
});
