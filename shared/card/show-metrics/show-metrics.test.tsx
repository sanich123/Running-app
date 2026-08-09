import { screen } from '@testing-library/react-native';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ShowMetrics from './show-metrics';

describe('Show metrics', () => {
  it('should correctly renders', async () => {
    await renderWithProviders(<ShowMetrics title="some title" metrics="some metrics" />, { store: mockStore });
    expect(screen.getByText('some title')).toBeOnTheScreen();
    expect(screen.getByText('some metrics')).toBeOnTheScreen();
  });
});
