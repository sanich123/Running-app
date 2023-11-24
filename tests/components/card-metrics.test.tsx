import { screen } from '@testing-library/react-native';

import CardMetrics from '../../components/card-metrics/card-metrics';
import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration } from '../../utils/time-formatter';
import { MOCK_DISTANCE, MOCK_DURATION } from '../mocks/mock-location';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Card metrics', () => {
  it('should correctly renders', () => {
    renderWithProviders(<CardMetrics distance={MOCK_DISTANCE} duration={MOCK_DURATION} />, { store: mockStore });
    ['pace', 'distance', 'time'].map((metric) => expect(screen.getByText(new RegExp(metric, 'i'))).toBeOnTheScreen());
    [getSpeedInMinsInKm(MOCK_DISTANCE, MOCK_DURATION).paceAsString, formatDuration(MOCK_DURATION)].map((metric) =>
      expect(screen.getByText(new RegExp(`${metric}`, 'i'))).toBeOnTheScreen(),
    );
  });
});
