import { screen } from '@testing-library/react-native';

import CardMetrics from './card-metrics';
import { MOCK_DISTANCE, MOCK_DURATION } from '../../tests/mocks/mock-location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration } from '../../utils/time-formatter';

describe('Card metrics', () => {
  it('should correctly renders', () => {
    renderWithProviders(<CardMetrics distance={MOCK_DISTANCE} duration={MOCK_DURATION} />, { store: mockStore });
    ['pace', 'distance', 'time'].map((metric) => expect(screen.getByText(new RegExp(metric, 'i'))).toBeOnTheScreen());
    [getSpeedInMinsInKm(MOCK_DISTANCE, MOCK_DURATION).paceAsString, formatDuration(MOCK_DURATION)].map((metric) =>
      expect(screen.getByText(new RegExp(`${metric}`, 'i'))).toBeOnTheScreen(),
    );
  });
});
