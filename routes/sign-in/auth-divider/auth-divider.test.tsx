import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import { AUTH_DIVIDER_TEXT } from '../const';
import AuthDivider from './auth-divider';

describe('AuthDivider', () => {
  it('shows the localized separator between sign-in methods', async () => {
    await renderWithProviders(<AuthDivider />);

    expect(screen.getByText(AUTH_DIVIDER_TEXT[LANGUAGES.russian])).toBeOnTheScreen();
  });
});
