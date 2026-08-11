import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { setIsDisabledWhenLogining, setSignInPageState } from '@R/slices/logining/logining';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import { SIGN_IN_FIELDS } from './const';
import { LOGIN_BTN } from './login-register-btn/const';
import SignIn from './sign-in';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));
jest.mock('expo-linking', () => ({ useURL: () => null, parse: jest.fn() }));
jest.mock('./intro/intro', () => () => null);

describe('sign in', () => {
  it('logs in with credentials entered by the user', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockStore.dispatch(setSignInPageState(SignInPageStates.login));
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
    await user.press(screen.getByText(LOGIN_BTN.russian.login));
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
});
