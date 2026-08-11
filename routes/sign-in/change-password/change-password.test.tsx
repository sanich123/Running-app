import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ChangePassword from './change-password';
import { CHANGE_PASSWORD_TEST_ID, CHANGE_PASSWORD_TEXT } from './const';

const mockReplace = jest.fn();
const mockSearchParams: { email?: string } = { email: 'runner@example.test' };

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockSearchParams,
}));

describe('change password', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockStore.dispatch({ type: 'auth/resetAuthSlice' });
  });

  it('shows and hides the password when the eye is pressed', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ChangePassword />);
    expect(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.input).props.secureTextEntry).toBe(true);
    await user.press(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.visibility));
    expect(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.input).props.secureTextEntry).toBe(false);
  });

  it('validates matching passwords and changes the password', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    server.use(
      http.post(`${BASE_URL}/auth/change-password`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ accessToken: 'new-access-token', userId: 'new-user-id' });
      }),
    );

    await renderWithProviders(<ChangePassword />);
    await user.type(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.input), 'Strong123');
    await user.type(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.confirmationInput), 'Strong123');
    await user.press(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.submit));

    await waitFor(() =>
      expect(requestBody).toEqual({
        password1: 'Strong123',
        password2: 'Strong123',
        email: 'runner@example.test',
      }),
    );
    expect(mockStore.getState().auth.accessToken).toBe('new-access-token');
    expect(mockStore.getState().auth.userId).toBe('new-user-id');
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });

  it('does not send different passwords', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ChangePassword />);
    await user.type(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.input), 'Strong123');
    await user.type(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.confirmationInput), 'Different123');
    await user.press(screen.getByTestId(CHANGE_PASSWORD_TEST_ID.submit));

    expect(await screen.findByText(CHANGE_PASSWORD_TEXT.mismatch)).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalledWith(ROUTES.root);
  });
});
