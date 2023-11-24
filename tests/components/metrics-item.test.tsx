import { screen } from '@testing-library/react-native';

import MetricsItem from '../../components/metrics-item/metrics-item';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

describe('Metrics item', () => {
  it('should correctly renders', () => {
    renderWithProviders(<MetricsItem isMapVisible title="some title" metric="123" isCentral />, { store: mockStore });
    expect(screen.getByText('some title')).toBeOnTheScreen();
    expect(screen.getByText('123')).toBeOnTheScreen();
  });
});
