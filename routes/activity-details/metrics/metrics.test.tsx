import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import Metrics from './metrics';

const mockUseActivityQuery = jest.fn();

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'activity-1' }) }));
jest.mock('@R/services/activity/activity', () => ({
  ...jest.requireActual('@R/services/activity/activity'),
  useGetActivityByActivityIdQuery: (...args: unknown[]) => mockUseActivityQuery(...args),
}));
jest.mock('../activity-chart/activity-chart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="activity-detail-chart" /> };
});

describe('Activity detail chart section', () => {
  beforeEach(() => {
    mockUseActivityQuery.mockReset();
  });

  it('renders the chart for activities with route data, even without heart-rate summaries', async () => {
    mockUseActivityQuery.mockReturnValue({
      data: {
        id: 'activity-1',
        userId: 'another-user',
        distance: 8_000,
        sport: 'run',
        averageHeartRate: null,
        profile: {
          allowActivityHeartRateViewing: true,
          allowActivityElevationViewing: true,
          allowActivityPaceViewing: true,
        },
      },
    });

    await renderWithProviders(<Metrics />);

    expect(screen.getByTestId('activity-detail-chart')).toBeOnTheScreen();
  });
});
