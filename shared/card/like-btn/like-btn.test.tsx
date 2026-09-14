import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from './const';
import ActivityCardLikeBtn from './like-btn';

describe('Activity card like btn', () => {
  it('should correctly renders when activity was liked by you', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" profile={MOCK_PROFILE} />, {
      store: mockStore,
    });
    const likesBtn = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED);
    expect(likesBtn).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt liked activity', async () => {
    mockStore.dispatch(setMockUserId('wrongUserId'));
    await renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" profile={MOCK_PROFILE} />, {
      store: mockStore,
    });
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
  });

  it('does not request likes when the activity count is zero', async () => {
    let requests = 0;
    const activityId = 'activity-without-likes';
    server.use(
      http.get(`${BASE_URL}/like/${activityId}`, () => {
        requests += 1;
        return HttpResponse.json([]);
      }),
    );

    await renderWithProviders(<ActivityCardLikeBtn activityId={activityId} likesLength={0} profile={MOCK_PROFILE} />);

    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
    expect(requests).toBe(0);
  });

  it('sends a like after the user presses the heart', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    mockStore.dispatch(setMockUserId('new-user-id'));
    server.use(
      http.post(`${BASE_URL}/like`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'new-like-id' }, { status: 201 });
      }),
    );
    await renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" profile={MOCK_PROFILE} />);
    const likeButton = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED);
    await waitFor(() => expect(likeButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(likeButton);
    await waitFor(() => expect(requestBody).toEqual({ activityId: 'someActivityId' }));
  });

  it('deletes the current user like after a second heart action', async () => {
    const user = userEvent.setup();
    let deletedUrl = '';
    mockStore.dispatch(setMockUserId('someUserId'));
    server.use(
      http.delete(`${BASE_URL}/like/:likeId/:activityId`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderWithProviders(<ActivityCardLikeBtn activityId="someActivityId" profile={MOCK_PROFILE} />);
    await user.press(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED));
    await waitFor(() => expect(deletedUrl).toContain('/someActivityId'));
  });
});
