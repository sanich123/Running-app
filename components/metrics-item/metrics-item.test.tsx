import { screen } from '@testing-library/react-native';

import MetricsItem from './metrics-item';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Metrics item', () => {
  it('should correctly renders', () => {
    renderWithProviders(<MetricsItem isMapVisible title="some title" metric="123" isCentral />, { store: mockStore });
    expect(screen.getByText('some title')).toBeOnTheScreen();
    expect(screen.getByText('123')).toBeOnTheScreen();
  });
});
