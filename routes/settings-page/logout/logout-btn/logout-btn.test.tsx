import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { RESET_STORE } from '@R/store';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import LogoutBtn from './logout-btn';
import { SETTINGS } from '../../const';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    canDismiss: () => false,
    dismissAll: jest.fn(),
    replace: mockReplace,
  }),
}));

describe('logout btn', () => {
  it('clears the session and returns to sign in', async () => {
    const user = userEvent.setup();
    let logoutRequestReceived = false;
    server.use(
      http.delete(`${BASE_URL}/notification/push-token`, () => HttpResponse.json({ enabled: false, updated: 1 })),
      http.post(`${BASE_URL}/auth/logout`, ({ request }) => {
        logoutRequestReceived = request.method === 'POST';
        return new HttpResponse(null, { status: 204 });
      }),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('logged-user'));
    const dispatch = jest.spyOn(mockStore, 'dispatch');
    await renderWithProviders(<LogoutBtn />);
    await user.press(screen.getByText(SETTINGS.english.logout));
    await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: RESET_STORE }));
    expect(logoutRequestReceived).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
  });
});
