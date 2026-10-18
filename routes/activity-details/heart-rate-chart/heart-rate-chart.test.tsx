import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import HeartRateChart from './heart-rate-chart';
import { HOME_ACTIVITY_FULL_VIEW } from '../metrics/const';
import type { ActivityChartDataResponse } from '@R/runich-api/types';

const mockUseGetActivityChartDataQuery = jest.fn();
jest.mock('@R/services/activity/activity', () => ({
  ...jest.requireActual('@R/services/activity/activity'),
  useGetActivityChartDataQuery: (...args: unknown[]) => mockUseGetActivityChartDataQuery(...args),
}));
jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return { LineChart: () => <View testID="heart-rate-line-chart" /> };
});
jest.mock('@S/error-component/error-component', () => {
  const { Pressable } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ refetch }: { refetch: () => void }) => <Pressable testID="heart-rate-chart-retry" onPress={refetch} />,
  };
});

const chartData: ActivityChartDataResponse = {
  locations: [
    { coords: { latitude: 0, longitude: 0, altitude: 100, timestamp: 1_000 } },
    { coords: { latitude: 0, longitude: 0.005, altitude: 110, timestamp: 121_000 } },
    { coords: { latitude: 0, longitude: 0.01, altitude: 120, timestamp: 241_000 } },
  ],
  heartRateSamples: [
    { timestamp: 1_000, beatsPerMinute: 110 },
    { timestamp: 121_000, beatsPerMinute: 130 },
    { timestamp: 241_000, beatsPerMinute: 150 },
  ],
};

describe('HeartRateChart', () => {
  const labels = HOME_ACTIVITY_FULL_VIEW[LANGUAGES.russian];

  beforeEach(() => {
    mockStore.dispatch(setMockUserId('viewer-1'));
    mockUseGetActivityChartDataQuery.mockReset();
  });

  it('shows the loading state while chart data is being fetched', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({ isLoading: true });

    await renderWithProviders(<HeartRateChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(screen.getByText(labels.chartLoading)).toBeOnTheScreen();
    expect(screen.queryByTestId('heart-rate-line-chart')).not.toBeOnTheScreen();
  });

  it('lets the user retry after a chart request fails', async () => {
    const refetch = jest.fn();
    mockUseGetActivityChartDataQuery.mockReturnValue({ error: { status: 'CUSTOM_ERROR' }, refetch });

    await renderWithProviders(<HeartRateChart activityId="activity-1" activityDistance={1_112} sport="run" />);
    fireEvent.press(screen.getByTestId('heart-rate-chart-retry'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when there is not enough chart data', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({
      data: { ...chartData, heartRateSamples: [] },
      isLoading: false,
    });

    await renderWithProviders(<HeartRateChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(screen.queryByTestId('heart-rate-line-chart')).not.toBeOnTheScreen();
    expect(screen.queryByText(labels.heartRateChartTitle)).not.toBeOnTheScreen();
  });

  it('shows the chart and its distance labels when data is available', async () => {
    mockUseGetActivityChartDataQuery.mockReturnValue({ data: chartData, isLoading: false });

    await renderWithProviders(<HeartRateChart activityId="activity-1" activityDistance={1_112} sport="run" />);

    expect(mockUseGetActivityChartDataQuery).toHaveBeenCalledWith(
      { activityId: 'activity-1', viewerId: 'viewer-1' },
      { skip: false },
    );
    expect(screen.getByTestId('heart-rate-line-chart')).toBeOnTheScreen();
    expect(screen.getByText(labels.heartRateChartTitle)).toBeOnTheScreen();
    expect(screen.getByText(labels.chartDistanceAxis)).toBeOnTheScreen();
  });
});
