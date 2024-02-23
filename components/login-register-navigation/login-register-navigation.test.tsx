import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { LOGIN_NAVIGATION } from './const';
import RegisterNavigation from './login-register-navigation';

describe('Register navigation', () => {
  it('should correctly renders in english', () => {
    const setPageState = jest.fn();
    renderWithProviders(
      <RegisterNavigation pageState={SignInPageStates.register} isDisabled={false} setPageState={setPageState} />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByText(LOGIN_NAVIGATION.english.text)).toBeOnTheScreen();
    expect(screen.getByText(LOGIN_NAVIGATION.english.btn)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const setPageState = jest.fn();
    renderWithProviders(
      <RegisterNavigation setPageState={setPageState} isDisabled={false} pageState={SignInPageStates.register} />,
      {
        store: mockStore,
      },
    );
    expect(screen.getByText(LOGIN_NAVIGATION.russian.text)).toBeOnTheScreen();
    expect(screen.getByText(LOGIN_NAVIGATION.russian.btn)).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const setPageState = jest.fn();
    renderWithProviders(
      <RegisterNavigation setPageState={setPageState} isDisabled pageState={SignInPageStates.register} />,
      {
        store: mockStore,
      },
    );
    const loginBtn = screen.getByText(LOGIN_NAVIGATION.russian.btn);
    expect(loginBtn).toBeDisabled();
  });
  it('should correctly handle isDisabled state in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const setPageState = jest.fn();
    renderWithProviders(
      <RegisterNavigation setPageState={setPageState} isDisabled pageState={SignInPageStates.register} />,
      {
        store: mockStore,
      },
    );
    const loginBtn = screen.getByText(LOGIN_NAVIGATION.russian.btn);
    expect(loginBtn).toBeDisabled();
  });
});
