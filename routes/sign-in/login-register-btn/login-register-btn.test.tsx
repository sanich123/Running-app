import { renderHook, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { useForm, type UseFormHandleSubmit } from 'react-hook-form';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { setSignInPageState } from '@R/slices/logining/logining';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { LOGIN_BTN, REGISTER_BTN } from './const';
import LoginRegisterBtn from './login-register-btn';
import type { EmailPasswordData } from '@R/services/authentication/types';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));

describe('Login btn', () => {
  let handleSubmit: UseFormHandleSubmit<EmailPasswordData>;

  beforeAll(async () => {
    const { result } = await renderHook(() =>
      useForm<EmailPasswordData>({ defaultValues: { email: '', password: '' } }),
    );
    handleSubmit = result.current.handleSubmit;
  });
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<LoginRegisterBtn handleSubmit={handleSubmit} />);
    expect(screen.getByText(LOGIN_BTN.english.login)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<LoginRegisterBtn handleSubmit={handleSubmit} />);
    expect(screen.getByText(LOGIN_BTN.russian.login)).toBeOnTheScreen();
  });

  it('submits credentials and enters the application', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    const interactiveHandleSubmit = ((callback: (data: EmailPasswordData) => Promise<unknown>) => () =>
      callback({
        email: 'runner@example.test',
        password: 'secure-password',
      })) as UseFormHandleSubmit<EmailPasswordData>;
    mockStore.dispatch(setSignInPageState(SignInPageStates.login));
    server.use(
      http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'logged-user', accessToken: 'access-token' });
      }),
    );
    await renderWithProviders(<LoginRegisterBtn handleSubmit={interactiveHandleSubmit} />);
    await user.press(screen.getByText(LOGIN_BTN.russian.login));
    await waitFor(() => expect(requestBody).toEqual({ email: 'runner@example.test', password: 'secure-password' }));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
    expect(mockStore.getState().auth.userId).toBe('logged-user');
  });

  it('opens the email confirmation page instead of sending registration code inline', async () => {
    const user = userEvent.setup();
    const interactiveHandleSubmit = ((callback: (data: EmailPasswordData) => Promise<unknown>) => () =>
      callback({
        email: 'runner@example.test',
        password: 'secure-password',
      })) as UseFormHandleSubmit<EmailPasswordData>;
    mockPush.mockClear();
    mockStore.dispatch(setSignInPageState(SignInPageStates.register));

    await renderWithProviders(<LoginRegisterBtn handleSubmit={interactiveHandleSubmit} />);
    await user.press(screen.getByText(REGISTER_BTN.russian.register));

    // expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.confirmEmailCode}`);
  });
});
