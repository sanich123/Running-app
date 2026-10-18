import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DashboardSkeleton from './dashboard-skeleton';

describe('DashboardSkeleton', () => {
  it('renders the dashboard loading state', async () => {
    await renderWithProviders(<DashboardSkeleton />);

    expect(screen.getByTestId('dashboard-skeleton')).toBeOnTheScreen();
  });
});
