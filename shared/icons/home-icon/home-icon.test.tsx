import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import HomeIcon from './home-icon';

describe('HomeIcon', () => {
  it('renders the home tab icon', async () => {
    await renderWithProviders(<HomeIcon focused={false} />);

    expect(screen.getByRole('button')).toBeOnTheScreen();
  });
});
