import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { setSignInPageState } from '@R/slices/logining/logining';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { RESET_NAVIGATION } from './const';
import RegisterNavigation from './login-register-navigation';

describe('Register navigation', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<RegisterNavigation />);
    expect(screen.getByText(RESET_NAVIGATION.english.text)).toBeOnTheScreen();
    expect(screen.getByText(RESET_NAVIGATION.english.btn)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<RegisterNavigation />);
    expect(screen.getByText(RESET_NAVIGATION.russian.text)).toBeOnTheScreen();
    expect(screen.getByText(RESET_NAVIGATION.russian.btn)).toBeOnTheScreen();
  });

  it('switches from login to password reset', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setSignInPageState(SignInPageStates.login));
    await renderWithProviders(<RegisterNavigation />);
    await user.press(screen.getByText(RESET_NAVIGATION.english.btn));
    expect(mockStore.getState().logining.pageState).toBe(SignInPageStates.reset);
  });
});
