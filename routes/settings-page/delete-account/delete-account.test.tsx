import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Platform } from 'react-native';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { DELETE_ACCOUNT } from './const';
import DeleteAccountBtn from './delete-account';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

describe('delete account', () => {
  it('deletes the account and returns to sign in after confirmation in the web flow', async () => {
    const user = userEvent.setup();
    const originalOS = Platform.OS;
    let deletedUrl = '';
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));
    server.use(
      http.delete(`${BASE_URL}/auth/${MOCK_SERVER_IDS.userId}`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<DeleteAccountBtn />);
    await user.press(screen.getByText(DELETE_ACCOUNT.russian.action));
    await waitFor(() => expect(deletedUrl).toContain(`/auth/${MOCK_SERVER_IDS.userId}`));
    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
