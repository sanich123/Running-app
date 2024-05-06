import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { LOGIN_BTN, REGISTER_BTN, RESET_BTN } from './const';
import LoginRegisterBtn from './login-register-btn';

describe('Login btn', () => {
  it('should correctly renders in english', () => {
    const setIsDisabled = jest.fn();
    const setIsLoading = jest.fn();
    const setEmailError = jest.fn();
    const setPasswordError = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(
      <LoginRegisterBtn
        email=""
        password=""
        isLoading={false}
        isDisabled={false}
        pageState={SignInPageStates.register}
        setIsDisabled={setIsDisabled}
        setIsLoading={setIsLoading}
        setEmailError={setEmailError}
        setPasswordError={setPasswordError}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(REGISTER_BTN.english.register)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    const setIsDisabled = jest.fn();
    const setIsLoading = jest.fn();
    const setEmailError = jest.fn();
    const setPasswordError = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(
      <LoginRegisterBtn
        email=""
        password=""
        isLoading={false}
        isDisabled={false}
        pageState={SignInPageStates.login}
        setIsDisabled={setIsDisabled}
        setIsLoading={setIsLoading}
        setEmailError={setEmailError}
        setPasswordError={setPasswordError}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(LOGIN_BTN.russian.login)).toBeOnTheScreen();
  });
  it('should correctly handle disable state', () => {
    const setIsDisabled = jest.fn();
    const setIsLoading = jest.fn();
    const setEmailError = jest.fn();
    const setPasswordError = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(
      <LoginRegisterBtn
        email=""
        password=""
        isLoading={false}
        isDisabled
        pageState={SignInPageStates.reset}
        setIsDisabled={setIsDisabled}
        setIsLoading={setIsLoading}
        setEmailError={setEmailError}
        setPasswordError={setPasswordError}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(RESET_BTN.russian.login)).toBeDisabled();
  });
});
