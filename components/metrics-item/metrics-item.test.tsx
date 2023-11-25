import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import MetricsItem from './metrics-item';

describe('Metrics item', () => {
  it('should correctly renders', () => {
    renderWithProviders(<MetricsItem isMapVisible title="some title" metric="123" isCentral />, { store: mockStore });
    expect(screen.getByText('some title')).toBeOnTheScreen();
    expect(screen.getByText('123')).toBeOnTheScreen();
  });
});
