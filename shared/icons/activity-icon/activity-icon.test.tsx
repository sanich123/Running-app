import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityIcon from './activity-icon';

describe('ActivityIcon', () => {
  it('renders the activity tab icon', async () => {
    await renderWithProviders(<ActivityIcon focused />);

    expect(screen.getByRole('button')).toBeOnTheScreen();
  });
});
