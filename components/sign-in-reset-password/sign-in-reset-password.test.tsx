import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { RESET_PASSWORD } from './const';
import SignInResetPassword from './sign-in-reset-password';

describe('SignInResetPassword', () => {
  it('should correctly renders in russian', () => {
    renderWithProviders(<SignInResetPassword />, { store: mockStore });
    expect(screen.getByText(RESET_PASSWORD.russian.redirectToResettingPage)).toBeOnTheScreen();
  });
  it('should correctly renders in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<SignInResetPassword />, { store: mockStore });
    expect(screen.getByText(RESET_PASSWORD.english.redirectToResettingPage)).toBeOnTheScreen();
  });
});
