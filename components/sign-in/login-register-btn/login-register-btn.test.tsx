import { renderHook, screen } from '@testing-library/react-native';
import { useForm, type UseFormHandleSubmit } from 'react-hook-form';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LOGIN_BTN } from './const';
import LoginRegisterBtn from './login-register-btn';
import type { EmailPasswordData } from '@R/services/authentication/types';

describe('Login btn', () => {
  let handleSubmit: UseFormHandleSubmit<EmailPasswordData>;

  beforeAll(async () => {
    const { result } = await renderHook(() =>
      useForm<EmailPasswordData>({ defaultValues: { email: '', password: '' } }),
    );
    handleSubmit = result.current.handleSubmit;
  });
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
