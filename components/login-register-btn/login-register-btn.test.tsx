import { screen } from '@testing-library/react-native';

import { LOGIN_BTN } from './const';
import LoginRegisterBtn from './login-register-btn';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Login btn', () => {
  it('should correctly renders in english', () => {
    const setIsDisabled = jest.fn();
    const setIsLoading = jest.fn();
    const setEmailError = jest.fn();
    const setPasswordError = jest.fn();
    renderWithProviders(
      <LoginRegisterBtn
        email=""
        password=""
        isLoading={false}
        isDisabled={false}
        isRegister={false}
        setIsDisabled={setIsDisabled}
        setIsLoading={setIsLoading}
        setEmailError={setEmailError}
        setPasswordError={setPasswordError}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(LOGIN_BTN.english.login)).toBeOnTheScreen();
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
        isRegister={false}
        setIsDisabled={setIsDisabled}
        setIsLoading={setIsLoading}
        setEmailError={setEmailError}
        setPasswordError={setPasswordError}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(LOGIN_BTN.russian.login)).toBeOnTheScreen();
  });
});
