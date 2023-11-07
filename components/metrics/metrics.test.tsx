import { screen } from '@testing-library/react-native';

import Metrics from './metrics';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Metrics', () => {
  it('should correctly renders when initial state in mockStore', () => {
    renderWithProviders(<Metrics />, { store: mockStore });
    ['Distance', 'Pace', 'Time'].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
    ['0 /km', '0.00 km', '00:00:00'].map((metric) => expect(screen.getByText(new RegExp(metric))).toBeOnTheScreen());
  });
});
