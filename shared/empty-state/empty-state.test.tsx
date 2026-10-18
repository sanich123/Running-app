import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import EmptyState from './empty-state';

describe('EmptyState', () => {
  it('shows the title and optional message', async () => {
    await renderWithProviders(<EmptyState icon="run" title="No activities" message="Try again later" />);

    expect(screen.getByText('No activities')).toBeOnTheScreen();
    expect(screen.getByText('Try again later')).toBeOnTheScreen();
  });
});
