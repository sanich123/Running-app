import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import AuthDivider from './auth-divider';

describe('AuthDivider', () => {
  it('shows the localized separator between sign-in methods', async () => {
    await renderWithProviders(<AuthDivider />);

    expect(screen.getByText('или')).toBeOnTheScreen();
  });
});
