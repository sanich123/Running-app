import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { EMAIL_LINK_NAVIGATION, RESET_NAVIGATION } from './const';
import RegisterNavigation from './login-register-navigation';

describe('Register navigation', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<RegisterNavigation authStep={SignInPageStates.register} />);
    expect(screen.getByText(RESET_NAVIGATION.english.text)).toBeOnTheScreen();
    expect(screen.getByText(RESET_NAVIGATION.english.btn)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<RegisterNavigation authStep={SignInPageStates.register} />);
    expect(screen.getByText(RESET_NAVIGATION.russian.text)).toBeOnTheScreen();
    expect(screen.getByText(RESET_NAVIGATION.russian.btn)).toBeOnTheScreen();
  });

  it('switches from login to password reset', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const onAuthStepChange = jest.fn();
    await renderWithProviders(<RegisterNavigation authStep={SignInPageStates.register} onAuthStepChange={onAuthStepChange} />);
    await user.press(screen.getByText(RESET_NAVIGATION.english.btn));
    expect(onAuthStepChange).toHaveBeenCalledWith(SignInPageStates.reset);
  });

  it('switches from login to email link authentication', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const onAuthStepChange = jest.fn();
    await renderWithProviders(<RegisterNavigation authStep={SignInPageStates.login} onAuthStepChange={onAuthStepChange} />);
    await user.press(screen.getByTestId('email-link-navigation'));
    expect(onAuthStepChange).toHaveBeenCalledWith(SignInPageStates.emailLink);
  });
});
