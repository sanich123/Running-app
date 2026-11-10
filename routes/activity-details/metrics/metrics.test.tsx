import { screen } from '@testing-library/react-native';
import { setMockUserId, mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import Metrics from './metrics';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'activity-1' }) }));
jest.mock('../activity-chart/activity-chart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="activity-detail-chart" /> };
});

describe('Activity detail chart section', () => {
  beforeEach(() => {
    mockStore.dispatch(setMockUserId('viewer-1'));
  });

  it('renders the chart for activities with route data, even without heart-rate summaries', async () => {
    await renderWithProviders(<Metrics />, { store: mockStore });

    expect(await screen.findByTestId('activity-detail-chart')).toBeOnTheScreen();
  });
});
