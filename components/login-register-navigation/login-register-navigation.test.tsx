import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { REGISTER_NAVIGATION } from './const';
import RegisterNavigation from './login-register-navigation';

describe('Register navigation', () => {
  it('should correctly renders in english', () => {
    const setIsRegister = jest.fn();
    renderWithProviders(<RegisterNavigation setIsRegister={setIsRegister} isDisabled={false} isRegister />, {
      store: mockStore,
    });
    expect(screen.getByText(REGISTER_NAVIGATION.english.text)).toBeOnTheScreen();
    expect(screen.getByText(REGISTER_NAVIGATION.english.btn)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const setIsRegister = jest.fn();
    renderWithProviders(<RegisterNavigation setIsRegister={setIsRegister} isDisabled={false} isRegister />, {
      store: mockStore,
    });
    expect(screen.getByText(REGISTER_NAVIGATION.russian.text)).toBeOnTheScreen();
    expect(screen.getByText(REGISTER_NAVIGATION.russian.btn)).toBeOnTheScreen();
  });
  it('should correctly handle isDisabled state in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const setIsRegister = jest.fn();
    renderWithProviders(<RegisterNavigation setIsRegister={setIsRegister} isDisabled isRegister />, {
      store: mockStore,
    });
    const loginBtn = screen.getByText(REGISTER_NAVIGATION.russian.btn);
    expect(loginBtn).toBeDisabled();
  });
  it('should correctly handle isDisabled state in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const setIsRegister = jest.fn();
    renderWithProviders(<RegisterNavigation setIsRegister={setIsRegister} isDisabled isRegister />, {
      store: mockStore,
    });
    const loginBtn = screen.getByText(REGISTER_NAVIGATION.english.btn);
    expect(loginBtn).toBeDisabled();
  });
});
