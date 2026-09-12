import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { setActivityOwnerProfile, setCommentActivityId } from '@R/slices/comment/comment';
import LikesList from '@Routes/likes-list/likes-list';
import MapPage from '@Routes/map-page/map-page';
import ActivityCard from '@S/card/card';
import CommentBtn from '@S/card/comment-btn/comment-btn';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from '@S/card/like-btn/const';
import LikeBtn from '@S/card/like-btn/like-btn';
import { COMMENT_INPUT_TEST_ID, COMMENT_ICON_TEST_ID } from '@S/comments/comment-input/const';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_COMMENTS, MOCK_SERVER_IDS, MOCK_SERVER_LIKES } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';

const mockPush = jest.fn();
let mockPathname = '/';
const mockParams: { id: string } = { id: MOCK_SERVER_IDS.activityId };

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

const cardProps = {
  isShowDeleteBtn: false,
  isShowDescription: true,
  description: MOCK_SERVER_ACTIVITY.description,
  title: MOCK_SERVER_ACTIVITY.title,
  date: MOCK_SERVER_ACTIVITY.date,
  sport: MOCK_SERVER_ACTIVITY.sport,
  id: MOCK_SERVER_ACTIVITY.id,
  userId: MOCK_SERVER_ACTIVITY.userId,
  photoVideoUrls: [...MOCK_SERVER_ACTIVITY.photoVideoUrls],
  mapPhotoUrl: 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/auto/360x360@2x?access_token=test',
  duration: MOCK_SERVER_ACTIVITY.duration,
  distance: MOCK_SERVER_ACTIVITY.distance,
  elevationGain: MOCK_SERVER_ACTIVITY.elevationGain,
  profile: MOCK_SERVER_ACTIVITY.profile,
  commentsLength: MOCK_SERVER_ACTIVITY._count.comments,
};

describe('activity and social integration flows', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockPathname = '/';
    mockParams.id = MOCK_SERVER_IDS.activityId;
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));
    mockStore.dispatch(setCommentActivityId(MOCK_SERVER_IDS.activityId));
    mockStore.dispatch(setActivityOwnerProfile(MOCK_SERVER_ACTIVITY.profile));
  });

  it('opens a profile, map, and full activity from an activity card', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ActivityCard {...cardProps} />);

    await user.press(screen.getByText(/Eliud Kipchoge/));
    expect(mockPush).toHaveBeenLastCalledWith(`/${ROUTES.profile}/${MOCK_SERVER_IDS.userId}`);

    const mapPreviews = screen.getAllByTestId(/api\.mapbox\.com/);
    await user.press(mapPreviews[mapPreviews.length - 1]);
    expect(mockPush).toHaveBeenLastCalledWith(`/${ROUTES.map}/${MOCK_SERVER_IDS.activityId}`);

    const activityTitles = screen.getAllByText(MOCK_SERVER_ACTIVITY.title);
    await user.press(activityTitles[activityTitles.length - 1]);
    expect(mockPush).toHaveBeenLastCalledWith(
      `/${ROUTES.activity}/${MOCK_SERVER_IDS.activityId}?userId=${MOCK_SERVER_IDS.userId}`,
    );
  });

  it('sets and removes an activity like through the API', async () => {
    let liked = false;
    let likeBody: unknown;
    let deletedUrl = '';
    const ownLike = {
      ...MOCK_SERVER_LIKES[0],
      id: 'own-like-id',
      authorId: MOCK_SERVER_IDS.userId,
    };

    server.use(
      http.get(`${BASE_URL}/like/${MOCK_SERVER_IDS.activityId}`, () =>
        HttpResponse.json(liked ? [...MOCK_SERVER_LIKES, ownLike] : MOCK_SERVER_LIKES),
      ),
      http.post(`${BASE_URL}/like`, async ({ request }) => {
        liked = true;
        likeBody = await request.json();
        return HttpResponse.json(ownLike, { status: 201 });
      }),
      http.delete(`${BASE_URL}/like/:likeId/:activityId`, ({ request }) => {
        liked = false;
        deletedUrl = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const user = userEvent.setup();
    await renderWithProviders(<LikeBtn activityId={MOCK_SERVER_IDS.activityId} profile={cardProps.profile} />);
    const likeButton = await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED);
    await waitFor(() => expect(likeButton.props.accessibilityState?.disabled).toBe(false));
    await user.press(likeButton);
    await waitFor(() => expect(likeBody).toEqual({ activityId: MOCK_SERVER_IDS.activityId }));
    await user.press(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED));

    await waitFor(() => expect(deletedUrl).toContain(`/like/own-like-id/${MOCK_SERVER_IDS.activityId}`));
  });

  it('shows the list of users who liked an activity', async () => {
    await renderWithProviders(<LikesList />);
    expect(await screen.findByText('Haile Gebrselassie')).toBeOnTheScreen();
    expect(screen.getByTestId('likes-list')).toBeOnTheScreen();
  });

  it('shows comments, likes a comment, and adds a new comment', async () => {
    let commentLikeState: { authorId: string; id: string }[] = [...MOCK_SERVER_COMMENTS.comments[0].commentLike];
    let commentLikeBody: unknown;
    let commentBody: unknown;
    const ownCommentLike = { authorId: MOCK_SERVER_IDS.userId, id: 'own-comment-like-id' };

    server.use(
      http.get(`${BASE_URL}/comment/${MOCK_SERVER_IDS.commentId}/like`, () => HttpResponse.json(commentLikeState)),
      http.post(`${BASE_URL}/comment/${MOCK_SERVER_IDS.commentId}/like`, async ({ request }) => {
        commentLikeBody = await request.json();
        commentLikeState = [...commentLikeState, ownCommentLike];
        return HttpResponse.json(ownCommentLike, { status: 201 });
      }),
      http.post(`${BASE_URL}/comment/${MOCK_SERVER_IDS.activityId}`, async ({ request }) => {
        commentBody = await request.json();
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    await renderWithProviders(
      <CommentBtn
        activityId={MOCK_SERVER_IDS.activityId}
        commentsLength={MOCK_SERVER_ACTIVITY._count.comments}
        profile={MOCK_SERVER_ACTIVITY.profile}
      />,
    );
    expect(await screen.findByText('Вдохновляет на свою пробежку.')).toBeOnTheScreen();

    await user.press(await screen.findByTestId('commentLikeBtn'));
    await waitFor(() => expect(commentLikeBody).toEqual({ commentId: MOCK_SERVER_IDS.commentId }));
    expect(await screen.findByTestId('commentLikeBtn-active')).toBeOnTheScreen();

    await user.type(await screen.findByTestId(COMMENT_INPUT_TEST_ID), 'Новый комментарий');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    await waitFor(() => expect(commentBody).toEqual({ comment: 'Новый комментарий' }));
  });

  it('loads the activity route map after opening it from the card destination', async () => {
    await renderWithProviders(<MapPage />);
    expect(await screen.findByTestId('activity-map-increase-zoom')).toBeOnTheScreen();
  });
});
