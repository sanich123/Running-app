import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import EmptyState from './empty-state';

describe('route replay empty state', () => {
  it('shows the reason playback is unavailable', async () => {
    await renderWithProviders(<EmptyState message="Not enough route data" />);

    expect(screen.getByText('Not enough route data')).toBeOnTheScreen();
  });
});
