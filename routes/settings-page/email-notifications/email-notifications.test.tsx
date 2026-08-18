import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import EmailNotificationsBtn from './email-notifications';

describe('EmailNotificationsBtn', () => {
  beforeEach(() => mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId)));

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
});
