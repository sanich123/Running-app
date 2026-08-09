import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { DELETE_ACCOUNT } from './const';
import DeleteAccountBtn from './delete-account';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

describe('delete account', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));
  });

  it('shows confirmation before deleting the account and returns to sign in after success', async () => {
    const user = userEvent.setup();
    let deletedUrl = '';
    server.use(
      http.delete(`${BASE_URL}/auth/${MOCK_SERVER_IDS.userId}`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<DeleteAccountBtn />);
    await user.press(screen.getByText(DELETE_ACCOUNT.russian.action));
    expect(screen.getByText(DELETE_ACCOUNT.russian.conscentDeleting)).toBeOnTheScreen();
    await user.press(screen.getByText(DELETE_ACCOUNT.russian.sure));
    await waitFor(() => expect(deletedUrl).toContain(`/auth/${MOCK_SERVER_IDS.userId}`));
    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.signIn}`);
  });

  it('keeps the dialog visible and blocks confirmation while deletion is loading', async () => {
    const user = userEvent.setup();
    server.use(http.delete(`${BASE_URL}/auth/${MOCK_SERVER_IDS.userId}`, loadingResponse));

    await renderWithProviders(<DeleteAccountBtn />);
    await user.press(screen.getByText(DELETE_ACCOUNT.russian.action));
    await user.press(screen.getByText(DELETE_ACCOUNT.russian.sure));

    expect(await screen.findByTestId('confirm-dialog-loading')).toBeOnTheScreen();
    expect(screen.getByTestId('confirm-dialog-confirm-button')).toBeDisabled();
    expect(screen.getByText(DELETE_ACCOUNT.russian.conscentDeleting)).toBeOnTheScreen();
  });

  it('closes the dialog after deletion fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.delete(`${BASE_URL}/auth/${MOCK_SERVER_IDS.userId}`, () =>
        HttpResponse.json({ message: 'Delete failed' }, { status: 500 }),
      ),
    );

    await renderWithProviders(<DeleteAccountBtn />);
    await user.press(screen.getByText(DELETE_ACCOUNT.russian.action));
    await user.press(screen.getByText(DELETE_ACCOUNT.russian.sure));

    await waitFor(() => expect(screen.queryByText(DELETE_ACCOUNT.russian.conscentDeleting)).not.toBeOnTheScreen());
    expect(mockReplace).not.toHaveBeenCalledWith(`/${ROUTES.signIn}`);
  });
});
