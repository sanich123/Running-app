import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DashboardHeroSkeleton from './dashboard-hero-skeleton';

describe('DashboardHeroSkeleton', () => {
  it('renders the dashboard hero loading placeholder', async () => {
    await renderWithProviders(<DashboardHeroSkeleton />);

    expect(screen.getByTestId('dashboard-hero-skeleton')).toBeOnTheScreen();
  });
});
