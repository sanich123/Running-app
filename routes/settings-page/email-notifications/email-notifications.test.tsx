import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { runichApi } from '@R/runich-api/runich-api';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import EmailNotificationsBtn from './email-notifications';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
const mockErrorToast = (jest.requireMock('@S/error-toast/error-toast') as { errorToast: jest.Mock }).errorToast;

describe('EmailNotificationsBtn', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    mockErrorToast.mockReset();
  });

  it('updates the setting through the server', async () => {
    let requestBody: unknown;
    server.use(
      http.patch(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(MOCK_SERVER_PROFILE);
      }),
    );
    await renderWithProviders(<EmailNotificationsBtn />);
    const notificationsSwitch = await screen.findByTestId('email-notifications-switch');
    await fireEvent(notificationsSwitch, 'valueChange', true);
    await waitFor(() => expect(requestBody).toEqual({ emailNotifications: true }));
  });

  it('reports a failed preference update', async () => {
    server.use(
      http.patch(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () => new HttpResponse(null, { status: 500 })),
    );
    await renderWithProviders(<EmailNotificationsBtn compact />);
    await fireEvent(screen.getByTestId('email-notifications-switch'), 'valueChange', false);
    await waitFor(() =>
      expect(mockErrorToast).toHaveBeenCalledWith('Не удалось изменить настройки уведомлений', expect.anything()),
    );
  });

  it('does not render when there is no signed-in user profile', async () => {
    mockStore.dispatch(setMockUserId(''));
    await renderWithProviders(<EmailNotificationsBtn compact />);
    expect(screen.queryByTestId('email-notifications-switch')).not.toBeOnTheScreen();
  });
});
