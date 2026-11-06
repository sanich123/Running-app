import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { setIsDisabledWhenLogining } from '@R/slices/logining/logining';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { SIGN_IN_ACCESS_DENIED_COPY, SIGN_IN_FIELDS } from './const';
import { EMAIL_REGISTRATION_RESTRICTION_COPY } from './email-registration-restriction/const';
import { LEGAL_CONSENTS_COPY } from './legal-consents/const';
import { LOGIN_BTN } from './login-register-btn/const';
import { REGISTER_NAVIGATION } from './login-register-navigation/const';
import SignIn from './sign-in';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockLinkingUrl: string | null = null;
let mockAuthParams: {
  authStep: string;
  oauthError?: string;
  returnTo?: string;
  accessDenied?: string;
} = { authStep: 'login' };
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
  beforeEach(() => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

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
    expect(emailInput.props.accessibilityLabel).toBe(SIGN_IN_FIELDS.email);
    expect(passwordInput.props.accessibilityLabel).toBe(SIGN_IN_FIELDS.password);
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
    await user.press(screen.getByText(LEGAL_CONSENTS_COPY[LANGUAGES.russian].agreementLink));
    await user.press(screen.getByText(LEGAL_CONSENTS_COPY[LANGUAGES.russian].privacyPolicyLink));
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
    expect(screen.getByText(EMAIL_REGISTRATION_RESTRICTION_COPY[LANGUAGES.russian].title)).toBeOnTheScreen();
    expect(screen.getByText(EMAIL_REGISTRATION_RESTRICTION_COPY[LANGUAGES.russian].description)).toBeOnTheScreen();
    await user.press(screen.getByText(EMAIL_REGISTRATION_RESTRICTION_COPY[LANGUAGES.russian].close));
    await waitFor(() =>
      expect(screen.queryByText(EMAIL_REGISTRATION_RESTRICTION_COPY[LANGUAGES.russian].title)).not.toBeOnTheScreen(),
    );
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
    await user.press(screen.getByText(LEGAL_CONSENTS_COPY[LANGUAGES.russian].personalDataLink));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.consents}`);
  });

  it('hides email link login from the compact login form', async () => {
    await renderWithProviders(<SignIn />);

    expect(screen.queryByTestId(`auth-mode-${SignInPageStates.login}`)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('email-link-navigation')).not.toBeOnTheScreen();
  });

  it('explains missing admin access and preserves the return route through sign-in navigation', async () => {
    const user = userEvent.setup();
    mockAuthParams = { authStep: SignInPageStates.login, returnTo: '/' + ROUTES.admin, accessDenied: 'true' };

    await renderWithProviders(<SignIn />);

    expect(screen.getByText(SIGN_IN_ACCESS_DENIED_COPY[LANGUAGES.russian])).toBeOnTheScreen();
    await user.press(screen.getByText(REGISTER_NAVIGATION[LANGUAGES.russian].btn));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/' + ROUTES.signIn,
      params: {
        authStep: SignInPageStates.register,
        returnTo: '/' + ROUTES.admin,
        accessDenied: 'true',
      },
    });
  });

  it('shows the localized admin access message in English', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockAuthParams = { authStep: SignInPageStates.login, accessDenied: 'true' };

    await renderWithProviders(<SignIn />);

    expect(screen.getByText(SIGN_IN_ACCESS_DENIED_COPY[LANGUAGES.english])).toBeOnTheScreen();
  });

  it('falls back to the login form for an unknown authentication step', async () => {
    mockAuthParams = { authStep: 'unknown' };

    await renderWithProviders(<SignIn />);

    expect(screen.getByTestId('auth-submit-text')).toHaveTextContent(LOGIN_BTN[LANGUAGES.russian].login);
    expect(screen.getByTestId(SIGN_IN_FIELDS.password)).toBeOnTheScreen();
  });

  it('shows the reset flow without a password input', async () => {
    mockAuthParams = { authStep: SignInPageStates.reset };

    await renderWithProviders(<SignIn />);

    expect(screen.queryByTestId(SIGN_IN_FIELDS.password)).toBeNull();
    expect(screen.getByTestId(SIGN_IN_FIELDS.email)).toBeOnTheScreen();
  });

  it('opens registration without carrying admin-only query parameters', async () => {
    const user = userEvent.setup();
    mockAuthParams = { authStep: SignInPageStates.login };

    await renderWithProviders(<SignIn />);
    await user.press(screen.getByText(REGISTER_NAVIGATION[LANGUAGES.russian].btn));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/' + ROUTES.signIn,
      params: { authStep: SignInPageStates.register },
    });
  });
});
