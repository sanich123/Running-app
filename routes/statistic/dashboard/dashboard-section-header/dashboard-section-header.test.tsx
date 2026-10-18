import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DashboardSectionHeader from './dashboard-section-header';

describe('DashboardSectionHeader', () => {
  it('shows the section title and description', async () => {
    await renderWithProviders(<DashboardSectionHeader title="Activity" subtitle="By month" />);

    expect(screen.getByText('Activity')).toBeOnTheScreen();
    expect(screen.getByText('By month')).toBeOnTheScreen();
  });
});
