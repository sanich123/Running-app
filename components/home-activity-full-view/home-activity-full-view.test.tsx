import { screen } from '@testing-library/react-native';

import ActivityFullViewMetrics from './home-activity-full-view';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: 'someActivityId',
  }),
}));

describe('Home activity full view', () => {
  it('should correctly renders', async () => {
    renderWithProviders(<ActivityFullViewMetrics />, { store: mockStore });
    expect(screen.getByTestId('activityFullViewMetricsIndicator')).toBeOnTheScreen();
    expect(await screen.findByText('Distance')).toBeOnTheScreen();
    expect(await screen.findByText('Avg Pace')).toBeOnTheScreen();
    expect(await screen.findByText('Moving Time')).toBeOnTheScreen();
    expect(await screen.findByText('00:58:34')).toBeOnTheScreen();
    expect(await screen.findByText('Elevation Gain')).toBeOnTheScreen();
    expect(await screen.findByText('21 m')).toBeOnTheScreen();
  });
});
