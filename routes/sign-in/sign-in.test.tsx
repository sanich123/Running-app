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

  it('shows the VK ID error returned by the backend', async () => {
    mockAuthParams = { authStep: 'login', oauthError: 'invalid code_verifier' };

    await renderWithProviders(<SignIn />);

    expect(await screen.findByText('invalid code_verifier')).toBeOnTheScreen();
    expect(screen.getByText('Не удалось войти через VK ID')).toBeOnTheScreen();
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
    await user.type(screen.getByTestId(SIGN_IN_FIELDS.email), 'runner@example.test');
    await user.type(screen.getByTestId(SIGN_IN_FIELDS.password), 'strong-password');
    await user.press(screen.getByTestId('auth-submit'));
    await waitFor(() => expect(requestBody).toEqual({ email: 'runner@example.test', password: 'strong-password' }));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });

  it('opens the privacy policy and legal information from the footer', async () => {
    const user = userEvent.setup();
    mockPush.mockClear();
    await renderWithProviders(<SignIn />);
    await user.press(screen.getByText('Политика конфиденциальности'));
    await user.press(screen.getByText('Юридическая информация'));
    expect(mockPush).toHaveBeenNthCalledWith(1, `/${ROUTES.privacyPolicy}`);
    expect(mockPush).toHaveBeenNthCalledWith(2, `/${ROUTES.legalInformation}`);
  });

  it('keeps the old navigation below the form and supports email link login', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SignIn />);

    expect(screen.queryByTestId(`auth-mode-${SignInPageStates.login}`)).not.toBeOnTheScreen();
    await user.press(screen.getByTestId('email-link-navigation'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: `/${ROUTES.signIn}`, params: { authStep: 'email-link' } });
  });
});
