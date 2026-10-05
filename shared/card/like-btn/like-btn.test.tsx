import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setActivityIdWhichLikesToUpdate } from '@R/slices/main-feed/main-feed';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from './const';
import ActivityCardLikeBtn from './like-btn';
import { ActivityCardContext } from '../context';
import type { ActivityCardData } from '../types';

function renderLikeBtn({
  activityId = 'someActivityId',
  likesLength,
  profile = MOCK_PROFILE,
}: { activityId?: string; likesLength?: number; profile?: ActivityCardData['profile'] } = {}) {
  return renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: {
          date: '2026-08-09T10:00:00.000Z',
          sport: 'run',
          id: activityId,
          userId: 'activity-owner',
          duration: 0,
          distance: 0,
          elevationGain: 0,
          profile,
          commentsLength: 0,
          likesLength,
        },
        isFullView: false,
        isShowDeleteBtn: false,
        isShowDescription: false,
      }}>
      <ActivityCardLikeBtn />
    </ActivityCardContext.Provider>,
  );
}

async function setCurrentUser(userId: string) {
  await act(async () => mockStore.dispatch(setMockUserId(userId)));
}

describe('Activity card like btn', () => {
  beforeEach(async () => {
    await act(async () => mockStore.dispatch(setActivityIdWhichLikesToUpdate('')));
  });

  it('should correctly renders when activity was liked by you', async () => {
    await setCurrentUser('someUserId');
    await renderLikeBtn();
    const likesBtn = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED);
    expect(likesBtn).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt liked activity', async () => {
    await setCurrentUser('wrongUserId');
    await renderLikeBtn();
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
  });

  it('does not request likes at first when the activity count is zero, then loads them after the first like', async () => {
    const user = userEvent.setup();
    let requests = 0;
    let liked = false;
    const activityId = 'activity-without-likes';
    const userId = 'zero-likes-user';
    const ownLike = { id: 'own-like-id', activityId, authorId: userId, date: new Date().toISOString() };
    await setCurrentUser(userId);
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId, emailNotifications: false }),
      ),
      http.get(`${BASE_URL}/like/${activityId}`, () => {
        requests += 1;
        return HttpResponse.json(liked ? [ownLike] : []);
      }),
      http.post(`${BASE_URL}/like`, () => {
        liked = true;
        return HttpResponse.json(ownLike, { status: 201 });
      }),
    );

    await renderLikeBtn({ activityId, likesLength: 0, profile: { ...MOCK_PROFILE, emailNotifications: false } });

    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
    expect(requests).toBe(0);

    await user.press(screen.getByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED));
    await waitFor(() => expect(requests).toBe(1));
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED)).toBeOnTheScreen();
  });

  it('updates loaded likes optimistically while the like request is pending', async () => {
    const user = userEvent.setup();
    const activityId = 'activity-with-existing-likes';
    const userId = 'optimistic-user';
    let requestStarted = false;
    let releasePost: () => void = () => undefined;
    const postReleased = new Promise<void>((resolve) => {
      releasePost = resolve;
    });
    await setCurrentUser(userId);
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId, emailNotifications: false }),
      ),
      http.get(`${BASE_URL}/like/${activityId}`, () =>
        HttpResponse.json([
          {
            id: 'other-like-id',
            activityId,
            authorId: 'other-user',
            date: new Date().toISOString(),
            profile: { name: 'Other' },
          },
        ]),
      ),
      http.post(`${BASE_URL}/like`, async () => {
        requestStarted = true;
        await postReleased;
        return HttpResponse.json(
          {
            id: 'optimistic-user-like-id',
            activityId,
            authorId: userId,
            date: new Date().toISOString(),
            profileId: 'optimistic-profile-id',
          },
          { status: 201 },
        );
      }),
    );

    await renderLikeBtn({ activityId, likesLength: 1, profile: { ...MOCK_PROFILE, emailNotifications: false } });

    await user.press(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED));
    await waitFor(() => expect(requestStarted).toBe(true));
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED)).toBeOnTheScreen();

    await act(async () => {
      releasePost();
      await postReleased;
      await waitFor(() => expect(mockStore.getState().loading.isLoading).toBe(false));
    });
  });

  it('recognizes the current user like even when it is outside the first page', async () => {
    const userId = 'older-like-owner';
    const activityId = 'activity-with-many-likes';
    await setCurrentUser(userId);
    server.use(
      http.get(`${BASE_URL}/user/${userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId, emailNotifications: false }),
      ),
      http.get(`${BASE_URL}/like/${activityId}`, () =>
        HttpResponse.json({
          likes: Array.from({ length: 30 }, (_, index) => ({
            id: `other-like-${index}`,
            activityId,
            authorId: `other-user-${index}`,
            date: new Date(Date.now() - index * 1000).toISOString(),
            profile: { name: 'Other' },
          })),
          hasMore: true,
          nextCursor: 'older-likes-cursor',
          currentUserLike: { id: 'own-older-like', authorId: userId },
        }),
      ),
    );

    await renderLikeBtn({ activityId, likesLength: 31, profile: { ...MOCK_PROFILE, emailNotifications: false } });

    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED)).toBeOnTheScreen();
  });

  it('sends a like after the user presses the heart', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    await setCurrentUser('new-user-id');
    server.use(
      http.post(`${BASE_URL}/like`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'new-like-id' }, { status: 201 });
      }),
    );
    await renderLikeBtn();
    const likeButton = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED);
    await waitFor(() => expect(likeButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(likeButton);
    await waitFor(() => expect(requestBody).toEqual({ activityId: 'someActivityId' }));
  });

  it('deletes the current user like after a second heart action', async () => {
    const user = userEvent.setup();
    let deletedUrl = '';
    await setCurrentUser('someUserId');
    server.use(
      http.delete(`${BASE_URL}/like/:likeId/:activityId`, ({ request }) => {
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await renderLikeBtn();
    await user.press(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED));
    await waitFor(() => expect(deletedUrl).toContain('/someActivityId'));
  });

  it('disables likes for external viewers when the activity owner opts out', async () => {
    await setCurrentUser('viewer-id');
    await renderLikeBtn({ profile: { ...MOCK_PROFILE, allowActivityInteractions: false } });

    const likeButton = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED);
    expect(likeButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('keeps likes enabled for the activity owner when external interactions are disabled', async () => {
    await setCurrentUser('activity-owner');
    await renderLikeBtn({ profile: { ...MOCK_PROFILE, allowActivityInteractions: false } });

    await waitFor(() =>
      expect(screen.getByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED).props.accessibilityState?.disabled).toBe(false),
    );
  });
});
