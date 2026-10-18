import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { FAVORITE_ACTIVITY_BUTTON_COPY, FAVORITE_ACTIVITY_BUTTON_TEST_ID } from './const';
import FavoriteActivityBtn from './favorite-activity-btn';

describe('FavoriteActivityBtn', () => {
  it('adds an activity to favorites when the user presses the button', async () => {
    let requestBody: unknown;
    server.use(
      http.patch(`${BASE_URL}/activity/favorite-activity/favorite`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'favorite-activity', isFavorite: true });
      }),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const user = userEvent.setup();

    await renderWithProviders(<FavoriteActivityBtn activityId="favorite-activity" isFavorite={false} />);

    const favoriteButton = screen.getByTestId(FAVORITE_ACTIVITY_BUTTON_TEST_ID);
    expect(favoriteButton).toHaveProp('accessibilityLabel', FAVORITE_ACTIVITY_BUTTON_COPY[LANGUAGES.russian].add);
    await user.press(favoriteButton);

    await waitFor(() => expect(requestBody).toEqual({ isFavorite: true }));
  });
});
