import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { LOGIN_BTN } from './const';
import LoginRegisterBtn from './login-register-btn';
jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'someUserId',
      app_metadata: {
        someProp: 'some value',
      },
      user_metadata: {
        someProp: 'some value',
      },
      aud: '',
      created_at: '',
    },
  }),
}));
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
        isRegister={false}
        setIsDisabled={setIsDisabled}
        setIsLoading={setIsLoading}
        setEmailError={setEmailError}
        setPasswordError={setPasswordError}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(LOGIN_BTN.russian.login)).toBeDisabled();
  });
});
