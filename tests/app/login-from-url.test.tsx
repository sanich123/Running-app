import { waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import type LoginFromUrlRouteComponent from '../../app/login-from-url';

const mockDismissAll = jest.fn();
const mockReplace = jest.fn();
const mockCanDismiss = jest.fn(() => true);
const mockErrorToast = jest.fn();
const mockParse = jest.fn((value: string) => ({
  queryParams: Object.fromEntries(new URL(value).searchParams.entries()),
}));
const mockUseLinkingURL = jest.fn();
let LoginFromUrlRoute: typeof LoginFromUrlRouteComponent;

jest.doMock('expo-router', () => ({
  useRouter: () => ({ dismissAll: mockDismissAll, replace: mockReplace, canDismiss: mockCanDismiss }),
}));
jest.doMock('expo-linking', () => ({
  __esModule: true,
  useLinkingURL: mockUseLinkingURL,
  parse: mockParse,
}));
jest.doMock('@S/error-toast/error-toast', () => ({
  errorToast: (...args: unknown[]) => mockErrorToast(...args),
}));

describe('login from URL', () => {
  beforeAll(() => {
    const linkingModule = jest.requireMock('expo-linking') as {
      useLinkingURL: typeof mockUseLinkingURL;
      parse: typeof mockParse;
    };
    linkingModule.useLinkingURL = mockUseLinkingURL;
    linkingModule.parse = mockParse;
    const loginFromUrlModule = require('../../app/login-from-url') as { default: typeof LoginFromUrlRoute };
    LoginFromUrlRoute = loginFromUrlModule.default;
  });

  beforeEach(() => {
    mockStore.dispatch(resetAuthSlice());
    jest.clearAllMocks();
    mockUseLinkingURL.mockReturnValue(null);
  });

  it('verifies the backend login code and opens the home page', async () => {
    let requestBody: unknown;
    server.use(
      http.post(`${BASE_URL}/auth/verify`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          userId: 'user-1',
        });
      }),
    );
    mockUseLinkingURL.mockReturnValue('https://runich.netlify.app/login-from-url?code=login-code');

    await renderWithProviders(<LoginFromUrlRoute />, { store: mockStore });

    await waitFor(() => expect(requestBody).toEqual({ code: 'login-code' }));
    expect(mockStore.getState().auth).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      userId: 'user-1',
    });
    expect(mockDismissAll).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });

  it('returns to sign-in and shows an OAuth error from the backend', async () => {
    mockUseLinkingURL.mockReturnValue(
      'https://runich.netlify.app/login-from-url?oauthError=VK%20%D0%BD%D0%B5%20%D0%B2%D0%B5%D1%80%D0%BD%D1%83%D0%BB%20device_id&oauthProvider=vk',
    );

    await renderWithProviders(<LoginFromUrlRoute />, { store: mockStore });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`));
    expect(mockDismissAll).toHaveBeenCalled();
    expect(mockErrorToast).toHaveBeenCalledWith('', 'VK не вернул device_id');
    expect(mockStore.getState().auth).toEqual({ accessToken: '', refreshToken: '', userId: '', appVersion: '' });
  });
});
