import { screen } from '@testing-library/react-native';

import ShowMetrics from './show-metrics';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Show metrics', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ShowMetrics title="some title" metrics="some metrics" />, { store: mockStore });
    expect(screen.getByText('some title')).toBeOnTheScreen();
    expect(screen.getByText('some metrics')).toBeOnTheScreen();
  });
});
