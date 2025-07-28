import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { renderHook, screen } from '@testing-library/react-native';
import { LOGIN_BTN } from './const';
import LoginRegisterBtn from './login-register-btn';
import { EmailPasswordData } from '@R/services/authentication/types';
import { useForm } from 'react-hook-form';

describe('Login btn', () => {
  const {
    result: {
      current: { handleSubmit },
    },
  } = renderHook(() => useForm<EmailPasswordData>({ defaultValues: { email: '', password: '' } }));
  it('should correctly renders in english', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<LoginRegisterBtn handleSubmit={handleSubmit} />);
    expect(screen.getByText(LOGIN_BTN.english.login)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<LoginRegisterBtn handleSubmit={handleSubmit} />);
    expect(screen.getByText(LOGIN_BTN.russian.login)).toBeOnTheScreen();
  });
});
