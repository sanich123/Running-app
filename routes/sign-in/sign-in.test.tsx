import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { setIsDisabledWhenLogining } from '@R/slices/logining/logining';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { SIGN_IN_FIELDS } from './const';
import SignIn from './sign-in';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockLinkingUrl: string | null = null;
let mockAuthParams: { authStep: string; oauthError?: string } = { authStep: 'login' };
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, dismissAll: jest.fn() }),
  useLocalSearchParams: () => mockAuthParams,
}));
jest.mock('expo-linking', () => ({
  useLinkingURL: () => mockLinkingUrl,
  parse: (value: string) => ({ queryParams: Object.fromEntries(new URL(value).searchParams.entries()) }),
}));
jest.mock('./intro/intro', () => () => null);

describe('sign in', () => {
  afterEach(() => {
    mockLinkingUrl = null;
    mockAuthParams = { authStep: 'login' };
    jest.clearAllMocks();
  });

  it('logs in with credentials entered by the user', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockStore.dispatch(setIsDisabledWhenLogining(false));
    server.use(
      http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      }),
    );
    await renderWithProviders(<SignIn />);
    const emailInput = screen.getByTestId(SIGN_IN_FIELDS.email);
    const passwordInput = screen.getByTestId(SIGN_IN_FIELDS.password);
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'runner@example.test');
    await user.type(passwordInput, 'strong-password');
    await user.press(screen.getByTestId('auth-submit'));
    await waitFor(() => expect(requestBody).toEqual({ email: 'runner@example.test', password: 'strong-password' }));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });

  it('opens the linked legal documents from the consent text', async () => {
    const user = userEvent.setup();
    mockPush.mockClear();
    await renderWithProviders(<SignIn />);
    await user.press(screen.getByText('Пользовательского соглашения'));
    await user.press(screen.getByText('Политикой в отношении обработки персональных данных'));
    expect(mockPush).toHaveBeenNthCalledWith(1, `/${ROUTES.userAgreement}`);
    expect(mockPush).toHaveBeenNthCalledWith(2, `/${ROUTES.privacyPolicy}`);
  });

  it('starts with legal consents selected and disables auth when either is unchecked', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockAuthParams = { authStep: SignInPageStates.register };
    mockStore.dispatch(setIsDisabledWhenLogining(false));
    server.use(
      http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ message: 'Confirmation code sent' });
      }),
    );

    await renderWithProviders(<SignIn />);
    const submit = screen.getByTestId('auth-submit');
    expect(submit).not.toBeDisabled();
    expect(screen.getByTestId('legal-consent-agreement').props.accessibilityState.checked).toBe(true);
    expect(screen.getByTestId('legal-consent-personal-data').props.accessibilityState.checked).toBe(true);
    await user.press(screen.getByTestId('legal-consent-agreement'));
    expect(submit).toBeDisabled();
    await user.press(screen.getByTestId('legal-consent-agreement'));
    expect(submit).not.toBeDisabled();
    expect(
      screen.getByText(/\* Регистрация по email — только с адресом российского почтового оператора/),
    ).toBeOnTheScreen();
    await user.press(screen.getByTestId('registration-email-restriction'));
    expect(screen.getByText('Ограничение регистрации')).toBeOnTheScreen();
    expect(screen.getByText(/С 1 декабря 2023 года Федеральный закон/)).toBeOnTheScreen();
    await user.press(screen.getByText('Закрыть'));
    await waitFor(() => expect(screen.queryByText('Ограничение регистрации')).not.toBeOnTheScreen());
    const emailInput = screen.getByTestId(SIGN_IN_FIELDS.email);
    const passwordInput = screen.getByTestId(SIGN_IN_FIELDS.password);
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'runner@yandex.ru');
    await user.type(passwordInput, 'strong-password');
    await user.press(screen.getByTestId('auth-submit'));

    await waitFor(() => expect(requestBody).toEqual({ email: 'runner@yandex.ru', password: 'strong-password' }));
  });

  it('opens the personal data consent document from the second checkbox', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SignIn />);
    await user.press(screen.getByText('согласие'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.consents}`);
  });

  it('hides email link login from the compact login form', async () => {
    await renderWithProviders(<SignIn />);

    expect(screen.queryByTestId(`auth-mode-${SignInPageStates.login}`)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('email-link-navigation')).not.toBeOnTheScreen();
  });
});
