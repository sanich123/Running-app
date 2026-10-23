import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import BlockedUsersPage from './blocked-users-page';
import { BLOCKED_USERS_COPY } from './const';

describe('BlockedUsersPage', () => {
  beforeEach(() => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('lists blocked profiles and refreshes the list after unblocking', async () => {
    const user = userEvent.setup();
    let isBlocked = true;
    server.use(
      http.get(`${BASE_URL}/moderation/blocks`, () =>
        HttpResponse.json({
          items: isBlocked
            ? [
                {
                  blockedUserId: 'blocked-user',
                  createdAt: '2026-10-20T10:00:00.000Z',
                  profile: { name: 'Алексей', surname: 'Воронин', profilePhoto: null, profilePhotoBlurhash: null },
                },
                { blockedUserId: 'missing-profile', createdAt: '2026-10-19T10:00:00.000Z', profile: null },
              ]
            : [],
        }),
      ),
      http.delete(`${BASE_URL}/moderation/blocks/blocked-user`, () => {
        isBlocked = false;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await renderWithProviders(<BlockedUsersPage />);
    expect(await screen.findByText('Алексей Воронин')).toBeOnTheScreen();
    expect(screen.getByText(BLOCKED_USERS_COPY[LANGUAGES.russian].fallbackName)).toBeOnTheScreen();
    await user.press(screen.getByTestId('unblock-user-blocked-user'));

    await waitFor(() => expect(screen.getByText(BLOCKED_USERS_COPY[LANGUAGES.russian].empty)).toBeOnTheScreen());
  });

  it('shows an empty state when the block list is empty', async () => {
    server.use(http.get(`${BASE_URL}/moderation/blocks`, () => HttpResponse.json({ items: [] })));

    await renderWithProviders(<BlockedUsersPage />);

    expect(await screen.findByText(BLOCKED_USERS_COPY[LANGUAGES.russian].empty)).toBeOnTheScreen();
  });

  it('shows a retryable error when the blocked user list cannot be loaded', async () => {
    server.use(
      http.get(`${BASE_URL}/moderation/blocks`, () =>
        HttpResponse.json({ message: 'temporary failure' }, { status: 500 }),
      ),
    );

    await renderWithProviders(<BlockedUsersPage />);

    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
