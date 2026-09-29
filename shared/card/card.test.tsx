import { act, screen, userEvent, waitFor, within } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { http, HttpResponse } from 'msw';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { finishLoading, resetLoading, startLoading } from '@R/slices/loading/loading';
import { changeLanguage } from '@R/slices/settings/settings';
import { clearSubscriptionSnapshot, setSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import * as activityMediaUtils from '@Routes/save-activity-page/utils';
import * as errorToastModule from '@S/error-toast/error-toast';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import * as fileSending from '@U/file-sending';
import ActivityCard from './card';
import { COMMENT_BTN_TEST_ID } from './comment-btn/const';
import { CARD_DELETE_BTN, CARD_DELETE_BTN_TEST_ID } from './delete-btn/const';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from './like-btn/const';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { BASE_URL } from '../../tests/utils/handlers';
import { mockStore, setMockUserId } from '../../tests/utils/mock-store';
import { server } from '../../tests/utils/server';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { COMMENT_ICON_TEST_ID, COMMENT_INPUT_TEST_ID } from '../comments/comment-input/const';
import type { ActivityCardData, ActivityCardProps } from './types';
import type { SPORTS_BTNS_VALUES } from '@const/sports';
import type { CommentResponse } from '@R/runich-api/types';

jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => 'somePathname',
}));

const defaultActivity: ActivityCardData = {
  title: MOCK_ACTIVITY.title,
  date: MOCK_ACTIVITY.date,
  sport: MOCK_ACTIVITY.sport,
  id: MOCK_ACTIVITY.id,
  userId: MOCK_ACTIVITY.userId,
  media: MOCK_ACTIVITY.media,
  duration: MOCK_ACTIVITY.duration,
  distance: MOCK_ACTIVITY.distance,
  elevationGain: MOCK_ACTIVITY.elevationGain,
  profile: MOCK_PROFILE,
  commentsLength: 0,
};

function renderCard(activity: Partial<ActivityCardData>, props: Partial<Omit<ActivityCardProps, 'activity'>> = {}) {
  return renderWithProviders(
    <ActivityCard
      activity={{ ...defaultActivity, ...activity }}
      isShowDeleteBtn={false}
      isShowDescription={false}
      {...props}
    />,
  );
}

function overridePlatformOS(os: typeof Platform.OS) {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
  return () => Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
}

function makeComment(activityId: string, authorId: string, id: string, comment: string): CommentResponse {
  return {
    activityId,
    authorId,
    comment,
    commentLike: [],
    date: '2026-08-09T10:00:00.000Z',
    id,
    profile: {
      emailNotifications: false,
      name: MOCK_PROFILE.name,
      surname: MOCK_PROFILE.surname,
      user: { email: 'card-comment-author@example.test' },
    },
    profileId: 'card-comment-profile',
  };
}

describe('Activity card', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    (Sharing.isAvailableAsync as jest.Mock).mockReset();
    (Sharing.shareAsync as jest.Mock).mockReset();
    (captureRef as jest.Mock).mockReset();
    mockStore.dispatch(clearSubscriptionSnapshot());
    mockStore.dispatch(resetLoading());
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not load full route locations for a feed card', async () => {
    let requests = 0;
    server.use(
      http.get(`${BASE_URL}/activity/${MOCK_ACTIVITY.id}/locations`, () => {
        requests += 1;
        return HttpResponse.json({ locations: [], kilometresSplit: [] });
      }),
    );

    await renderCard({ mapPhotoUrl: 'https://api.mapbox.com/styles/v1/map.png' });

    expect(requests).toBe(0);
  });

  it('keeps the saved map preview in the full view', async () => {
    const mapPhotoUrl = 'https://cdn.example.test/activity-map.jpg';

    await renderCard({ mapPhotoUrl }, { isFullView: true });

    await waitFor(() => expect(screen.getAllByTestId(mapPhotoUrl)).toHaveLength(1));
  });

  it('renders the premium map actions on the activity map image', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setMockUserId('premium-card-owner'));
    mockStore.dispatch(
      setSubscriptionSnapshot({
        userId: 'premium-card-owner',
        isPremium: true,
        status: 'active',
        provider: 'manual',
        productId: 'annual',
        startsAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2027-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      }),
    );

    await renderCard({ userId: 'premium-card-owner', mapPhotoUrl: 'https://cdn.example.test/premium-map.jpg' });

    const mapImage = within(screen.getByTestId('activity-map-media-item'));
    expect(mapImage.getByTestId('activity-card-add-media-button')).toBeOnTheScreen();
    expect(mapImage.getByTestId('activity-card-route-replay-button')).toBeOnTheScreen();

    await user.press(mapImage.getByTestId('activity-card-route-replay-button'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/${MOCK_ACTIVITY.id}?replay=1&userId=premium-card-owner`);
  });

  it('hides map actions when the user has no active subscription', async () => {
    mockStore.dispatch(setMockUserId('premium-card-owner'));
    await renderCard({ userId: 'premium-card-owner', mapPhotoUrl: 'https://cdn.example.test/no-premium-map.jpg' });

    const mapImage = within(screen.getByTestId('activity-map-media-item'));
    expect(mapImage.queryByTestId('activity-card-add-media-button')).not.toBeOnTheScreen();
    expect(mapImage.queryByTestId('activity-card-route-replay-button')).not.toBeOnTheScreen();
  });

  it('hides map actions for an expired subscription snapshot', async () => {
    mockStore.dispatch(setMockUserId('premium-card-owner'));
    mockStore.dispatch(
      setSubscriptionSnapshot({
        userId: 'premium-card-owner',
        isPremium: true,
        status: 'expired',
        provider: 'manual',
        productId: 'annual',
        startsAt: '2025-01-01T00:00:00.000Z',
        expiresAt: '2025-12-31T23:59:59.000Z',
        cancelAtPeriodEnd: false,
      }),
    );
    await renderCard({ userId: 'premium-card-owner', mapPhotoUrl: 'https://cdn.example.test/expired-map.jpg' });

    const mapImage = within(screen.getByTestId('activity-map-media-item'));
    expect(mapImage.queryByTestId('activity-card-add-media-button')).not.toBeOnTheScreen();
    expect(mapImage.queryByTestId('activity-card-route-replay-button')).not.toBeOnTheScreen();
  });

  it('routes to the activity map when its map preview is pressed', async () => {
    const user = userEvent.setup();
    const activityId = 'card-map-route';
    await renderCard({ id: activityId, mapPhotoUrl: 'https://cdn.example.test/card-map-route.jpg' });

    await user.press(screen.getByRole('button', { name: 'Открыть карту тренировки' }));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/${activityId}`);
  });

  it('routes to the selected activity photo', async () => {
    const user = userEvent.setup();
    const restorePlatform = overridePlatformOS('ios');
    const activityId = 'card-photo-route';
    const photoUrl = 'https://cdn.example.test/card-photo-route.jpg';

    try {
      await renderCard({
        id: activityId,
        media: [{ url: photoUrl, thumbnail: null, blurhash: 'photo-route-hash' }],
      });
      expect(screen.getByTestId(photoUrl).props.placeholder).toBe('photo-route-hash');
      await user.press(screen.getByTestId(photoUrl));

      expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/${activityId}?indexOfPhoto=0`);
    } finally {
      restorePlatform();
    }
  });

  it('renders route, photo, map metadata, and running metrics in a feed card', async () => {
    const mapPhotoUrl = 'https://cdn.example.test/card-map.jpg';
    const description = 'A steady run along the river with a few hills.';

    await renderCard(
      {
        title: 'Evening run',
        description,
        sport: 'run',
        duration: 3_600_000,
        distance: 5_200,
        elevationGain: 42,
        caloriesActive: 320,
        mapPhotoUrl,
        mapPhotoUrlBlurhash: 'map-blurhash',
        media: [],
        locationName: 'Парк Горького',
        weatherTemperature: 18.4,
        weatherWindSpeed: 6.2,
        weatherCode: 0,
        emotion: EMOTIONS_BTNS_VALUES.good,
      },
      { isShowDescription: true },
    );

    expect(screen.getByText('Evening run')).toBeOnTheScreen();
    expect(screen.getByText(description)).toHaveProp('numberOfLines', 4);
    expect(screen.getByText('42 м')).toBeOnTheScreen();
    expect(screen.queryByText('320 ккал')).not.toBeOnTheScreen();
    expect(screen.getByText('Парк Горького')).toBeOnTheScreen();
    expect(screen.getByText('18°C')).toBeOnTheScreen();
    expect(screen.getByText('6 м/с')).toBeOnTheScreen();
    expect(screen.getByTestId('map-emotion-icon')).toBeOnTheScreen();
    expect(screen.getByTestId(mapPhotoUrl).props.placeholder).toBe('map-blurhash');
  });

  it('renders full-view walking steps and calories without truncating activity text', async () => {
    const description = 'A longer walking activity description that remains fully visible in the detail view.';

    await renderCard(
      {
        title: 'Recovery walk',
        description,
        sport: 'walk',
        duration: 1_800_000,
        distance: 2_400,
        elevationGain: 0,
        steps: 1_234,
        caloriesActive: 280,
      },
      { isFullView: true, isShowDescription: true },
    );

    expect(screen.getByText('Recovery walk').props.numberOfLines).toBeUndefined();
    expect(screen.getByText(description).props.numberOfLines).toBeUndefined();
    expect(screen.getByText('1234')).toBeOnTheScreen();
    expect(screen.getByText('280 ккал')).toBeOnTheScreen();
    expect(screen.queryByText(/Темп/)).not.toBeOnTheScreen();
  });

  it('likes and unlikes an activity through successful MSW responses', async () => {
    const user = userEvent.setup();
    const activityId = 'card-like-flow';
    const authorId = 'card-like-owner';
    let currentLikes: { id: string; activityId: string; authorId: string; date: string }[] = [];
    let createdLikeBody: unknown;
    let deletedLikeUrl = '';

    server.use(
      http.get(`${BASE_URL}/user/${authorId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId: authorId, emailNotifications: false }),
      ),
      http.get(`${BASE_URL}/like/${activityId}`, () => HttpResponse.json(currentLikes)),
      http.post(`${BASE_URL}/like`, async ({ request }) => {
        createdLikeBody = await request.json();
        currentLikes = [{ id: 'card-like-id', activityId, authorId, date: '2026-09-01T12:00:00.000Z' }];
        return HttpResponse.json(currentLikes[0], { status: 201 });
      }),
      http.delete(`${BASE_URL}/like/:likeId/:activityId`, ({ request }) => {
        deletedLikeUrl = request.url;
        currentLikes = [];
        return new HttpResponse(null, { status: 204 });
      }),
    );

    mockStore.dispatch(setMockUserId(authorId));
    await renderCard({ id: activityId, userId: 'activity-owner', likesLength: 0, profile: { ...MOCK_PROFILE } });

    await user.press(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED));
    await waitFor(() => expect(createdLikeBody).toEqual({ activityId }));
    await user.press(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_LIKED));

    await waitFor(() => expect(deletedLikeUrl).toContain('/like/card-like-id/card-like-flow'));
    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
  });

  it('keeps an activity unliked when the server rejects the like', async () => {
    const user = userEvent.setup();
    const activityId = 'card-like-error';
    const authorId = 'card-like-error-owner';
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);

    server.use(
      http.get(`${BASE_URL}/user/${authorId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId: authorId, emailNotifications: false }),
      ),
      http.post(`${BASE_URL}/like`, () => HttpResponse.json({ message: 'Like rejected' }, { status: 503 })),
    );

    mockStore.dispatch(setMockUserId(authorId));
    await renderCard({ id: activityId, userId: 'activity-owner', likesLength: 0 });
    await user.press(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED));

    await waitFor(() => expect(errorToast).toHaveBeenCalled());
    expect(screen.getByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
  });

  it('creates, edits, and deletes comments from the activity card', async () => {
    const user = userEvent.setup();
    const activityId = 'card-comment-flow';
    const authorId = 'card-comment-author';
    const commentId = 'card-comment-id';
    let comments = [makeComment(activityId, authorId, commentId, 'Original card comment')];
    let createdCommentBody: unknown;
    let updatedCommentBody: unknown;
    let deletedCommentUrl = '';

    server.use(
      http.get(`${BASE_URL}/user/${authorId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId: authorId, emailNotifications: false }),
      ),
      http.get(`${BASE_URL}/comment/${activityId}`, () =>
        HttpResponse.json({ comments, hasMore: false, nextCursor: null }),
      ),
      http.get(`${BASE_URL}/comment/${activityId}/count`, () => HttpResponse.json(comments.length)),
      http.patch(`${BASE_URL}/comment/${commentId}`, async ({ request }) => {
        updatedCommentBody = await request.json();
        comments = comments.map((item) => (item.id === commentId ? { ...item, comment: 'Edited card comment' } : item));
        return HttpResponse.json(comments[0]);
      }),
      http.delete(`${BASE_URL}/comment/${commentId}`, ({ request }) => {
        deletedCommentUrl = request.url;
        comments = [];
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(`${BASE_URL}/comment/${activityId}`, async ({ request }) => {
        createdCommentBody = await request.json();
        comments = [...comments, makeComment(activityId, authorId, 'new-card-comment', 'New card comment')];
        return HttpResponse.json({ id: 'new-card-comment' }, { status: 201 });
      }),
    );

    mockStore.dispatch(setMockUserId(authorId));
    await renderCard({ id: activityId, userId: 'activity-owner', commentsLength: 1 });
    await user.press(await screen.findByTestId(COMMENT_BTN_TEST_ID));
    expect(await screen.findByText('Original card comment')).toBeOnTheScreen();

    await user.press(screen.getByTestId('comment-edit-button'));
    const editInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.clear(editInput);
    await user.type(editInput, 'Edited card comment');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    await waitFor(() => expect(updatedCommentBody).toEqual({ comment: 'Edited card comment' }));
    expect(await screen.findByText('Edited card comment')).toBeOnTheScreen();

    await user.press(screen.getByTestId('comment-delete-button'));
    await waitFor(() => expect(deletedCommentUrl).toContain(`/comment/${commentId}`));
    await waitFor(() => expect(screen.queryByText('Edited card comment')).not.toBeOnTheScreen());

    const createInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.type(createInput, 'New card comment');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    await waitFor(() => expect(createdCommentBody).toEqual({ comment: 'New card comment' }));
    expect(await screen.findByText('New card comment')).toBeOnTheScreen();
  });

  it('keeps comments intact when create, edit, and delete requests fail', async () => {
    const user = userEvent.setup();
    const activityId = 'card-comment-errors';
    const authorId = 'card-comment-error-author';
    const commentId = 'card-comment-error-id';
    const comments = [makeComment(activityId, authorId, commentId, 'Existing comment')];
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);

    server.use(
      http.get(`${BASE_URL}/user/${authorId}/profile`, () =>
        HttpResponse.json({ ...MOCK_PROFILE, userId: authorId, emailNotifications: false }),
      ),
      http.get(`${BASE_URL}/comment/${activityId}`, () =>
        HttpResponse.json({ comments, hasMore: false, nextCursor: null }),
      ),
      http.get(`${BASE_URL}/comment/${activityId}/count`, () => HttpResponse.json(comments.length)),
      http.patch(`${BASE_URL}/comment/${commentId}`, () =>
        HttpResponse.json({ message: 'Edit rejected' }, { status: 409 }),
      ),
      http.delete(`${BASE_URL}/comment/${commentId}`, () =>
        HttpResponse.json({ message: 'Delete rejected' }, { status: 500 }),
      ),
      http.post(`${BASE_URL}/comment/${activityId}`, () =>
        HttpResponse.json({ message: 'Create rejected' }, { status: 400 }),
      ),
    );

    mockStore.dispatch(setMockUserId(authorId));
    await renderCard({ id: activityId, userId: 'activity-owner', commentsLength: 1 });
    await user.press(await screen.findByTestId(COMMENT_BTN_TEST_ID));
    expect(await screen.findByText('Existing comment')).toBeOnTheScreen();

    await user.press(screen.getByTestId('comment-edit-button'));
    const editInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.clear(editInput);
    await user.type(editInput, 'Rejected edit');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(1));

    await user.press(screen.getByTestId('comment-delete-button'));
    await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Existing comment')).toBeOnTheScreen();

    await user.press(screen.getByTestId('comment-input-cancel'));
    const createInput = screen.getByTestId(COMMENT_INPUT_TEST_ID);
    await user.type(createInput, 'Rejected create');
    await user.press(screen.getByTestId(COMMENT_ICON_TEST_ID));
    await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(3));
  });

  it('deletes an activity after confirmation using a 204 MSW response', async () => {
    const user = userEvent.setup();
    const restorePlatform = overridePlatformOS('ios');
    const activityId = 'card-delete-success';
    let deletedActivityId = '';

    server.use(
      http.delete(`${BASE_URL}/activity/${activityId}`, ({ request }) => {
        deletedActivityId = new URL(request.url).pathname.split('/').at(-1) ?? '';
        return new HttpResponse(null, { status: 204 });
      }),
    );

    mockStore.dispatch(setMockUserId('card-delete-owner'));
    try {
      await renderCard({ id: activityId, userId: 'card-delete-owner' }, { isShowDeleteBtn: true });
      await user.press(screen.getByTestId(CARD_DELETE_BTN_TEST_ID));
      expect(await screen.findByText(CARD_DELETE_BTN.russian.deleteActivity)).toBeOnTheScreen();
      await user.press(screen.getByTestId('confirm-dialog-confirm-button'));

      await waitFor(() => expect(deletedActivityId).toBe(activityId));
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
    } finally {
      restorePlatform();
    }
  });

  it('keeps the activity visible when its delete request fails', async () => {
    const user = userEvent.setup();
    const restorePlatform = overridePlatformOS('ios');
    const activityId = 'card-delete-error';
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);

    server.use(
      http.delete(`${BASE_URL}/activity/${activityId}`, () =>
        HttpResponse.json({ message: 'Delete rejected' }, { status: 500 }),
      ),
    );

    mockStore.dispatch(setMockUserId('card-delete-error-owner'));
    try {
      await renderCard({ id: activityId, userId: 'card-delete-error-owner' }, { isShowDeleteBtn: true });
      await user.press(screen.getByTestId(CARD_DELETE_BTN_TEST_ID));
      await user.press(screen.getByTestId('confirm-dialog-confirm-button'));

      await waitFor(() => expect(errorToast).toHaveBeenCalled());
      expect(screen.getByTestId(CARD_DELETE_BTN_TEST_ID)).toBeOnTheScreen();
      expect(mockReplace).not.toHaveBeenCalled();
    } finally {
      restorePlatform();
    }
  });

  it('uploads a selected photo to a premium activity through MSW', async () => {
    const user = userEvent.setup();
    const activityId = 'card-photo-upload';
    const ownerId = 'card-photo-owner';
    const uploadedMedia = [
      {
        url: 'https://cdn.example.test/uploaded-photo.jpg',
        thumbnail: 'https://cdn.example.test/uploaded-photo-thumb.jpg',
      },
    ];
    const gallery = jest.spyOn(fileSending, 'getAccessToGallery').mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///card-photo.jpg', fileName: 'card-photo.jpg', mimeType: 'image/jpeg' }],
    } as never);
    jest.spyOn(activityMediaUtils, 'uploadActivityMediaBatch').mockResolvedValue(uploadedMedia as never);
    let appendedMediaBody: unknown;

    server.use(
      http.post(`${BASE_URL}/activity/${activityId}/media`, async ({ request }) => {
        appendedMediaBody = await request.json();
        return HttpResponse.json({ success: true, media: uploadedMedia }, { status: 201 });
      }),
    );
    mockStore.dispatch(setMockUserId(ownerId));
    mockStore.dispatch(
      setSubscriptionSnapshot({
        userId: ownerId,
        isPremium: true,
        status: 'active',
        provider: 'manual',
        productId: 'annual',
        startsAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2027-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      }),
    );

    await renderCard({ id: activityId, userId: ownerId, mapPhotoUrl: 'https://cdn.example.test/upload-map.jpg' });
    await user.press(screen.getByTestId('activity-card-add-media-button'));

    await waitFor(() => expect(appendedMediaBody).toEqual({ media: uploadedMedia }));
    expect(gallery).toHaveBeenCalledWith(
      ['images'],
      expect.objectContaining({ allowsMultipleSelection: true, selectionLimit: expect.any(Number) }),
    );
  });

  it('cleans up uploaded files when appending media to the activity fails', async () => {
    const user = userEvent.setup();
    const activityId = 'card-photo-upload-error';
    const ownerId = 'card-photo-error-owner';
    const uploadedMedia = [
      {
        url: 'https://cdn.example.test/failed-photo.jpg',
        thumbnail: 'https://cdn.example.test/failed-photo-thumb.jpg',
      },
    ];
    jest.spyOn(fileSending, 'getAccessToGallery').mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///failed-photo.jpg', fileName: 'failed-photo.jpg', mimeType: 'image/jpeg' }],
    } as never);
    jest.spyOn(activityMediaUtils, 'uploadActivityMediaBatch').mockResolvedValue(uploadedMedia as never);
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    const deletedUrls: string[] = [];

    server.use(
      http.post(`${BASE_URL}/activity/${activityId}/media`, () =>
        HttpResponse.json({ message: 'Activity media rejected' }, { status: 500 }),
      ),
      http.delete(`${BASE_URL}/photo`, async ({ request }) => {
        const { url } = (await request.json()) as { url: string };
        deletedUrls.push(url);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    mockStore.dispatch(setMockUserId(ownerId));
    mockStore.dispatch(
      setSubscriptionSnapshot({
        userId: ownerId,
        isPremium: true,
        status: 'active',
        provider: 'manual',
        productId: 'annual',
        startsAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2027-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      }),
    );

    await renderCard({ id: activityId, userId: ownerId, mapPhotoUrl: 'https://cdn.example.test/upload-error-map.jpg' });
    await user.press(screen.getByTestId('activity-card-add-media-button'));

    await waitFor(() => expect(errorToast).toHaveBeenCalled());
    await waitFor(() => expect(deletedUrls).toEqual([uploadedMedia[0].url, uploadedMedia[0].thumbnail]));
  });

  it('renders the share image only while sharing', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
    let resolveCapture: ((result: string) => void) | undefined;
    (captureRef as jest.Mock).mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveCapture = resolve;
        }),
    );

    await renderCard({
      title: 'Morning run',
      date: '2026-08-09T10:00:00.000Z',
      sport: 'run',
      id: 'activity-1',
      userId: 'user-1',
      duration: 300000,
      distance: 5000,
      elevationGain: 85,
      steps: 320,
      caloriesActive: 280,
      media: [],
    });

    expect(screen.queryByText('runich')).not.toBeOnTheScreen();
    const sharePress = user.press(screen.getByTestId('iconShareBtn'));
    const shareImageNode = await screen.findByTestId('share-activity-image');
    const shareImage = within(shareImageNode);
    await waitFor(() => expect(captureRef).toHaveBeenCalled());
    expect(shareImage.getByText('Morning run')).toBeOnTheScreen();
    expect(shareImage.getByTestId('share-profile-avatar')).toBeOnTheScreen();
    expect(shareImage.getByTestId('share-metrics-grid').props.children).toHaveLength(6);
    expect(shareImage.getByText('85 m')).toBeOnTheScreen();
    expect(shareImage.getByText('320')).toBeOnTheScreen();
    expect(shareImage.getByText('280 kcal')).toBeOnTheScreen();
    resolveCapture?.('snapshot.png');
    await sharePress;
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalledWith('snapshot.png'));
    expect(screen.queryByText('runich')).not.toBeOnTheScreen();
  });

  it('should correctly renders', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const { description, title, date, id, media, profile, duration, distance, sport } = MOCK_ACTIVITY;
    await renderCard(
      {
        description,
        title,
        date: `${new Date(date)}`,
        sport: sport as SPORTS_BTNS_VALUES,
        id,
        userId: 'someUserId',
        media,
        duration,
        distance,
        elevationGain: MOCK_ACTIVITY.elevationGain,
        profile: MOCK_PROFILE,
        commentsLength: 6,
      },
      { isShowDeleteBtn: true, isShowDescription: true },
    );
    expect(screen.getByText(new RegExp(`${profile.name}`))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`${profile.surname}`))).toBeOnTheScreen();
    expect(await screen.findAllByText(title)).toHaveLength(1);
    ['Time', 'Pace', 'Distance'].map(async (word) =>
      expect(await screen.getAllByText(new RegExp(word))).toHaveLength(1),
    );
  });

  it('renders the social actions and shows delete only for the activity owner when enabled', async () => {
    mockStore.dispatch(setMockUserId('activity-owner'));
    await renderCard({ userId: 'activity-owner' }, { isShowDeleteBtn: true });

    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
    expect(screen.getByTestId(COMMENT_BTN_TEST_ID)).toBeOnTheScreen();
    expect(screen.getByTestId('iconShareBtn')).toBeOnTheScreen();
    expect(screen.getByTestId(CARD_DELETE_BTN_TEST_ID)).toBeOnTheScreen();
  });

  it('hides the delete action for another user activity', async () => {
    mockStore.dispatch(setMockUserId('current-user'));
    await renderCard({ userId: 'activity-owner' }, { isShowDeleteBtn: true });

    expect(await screen.findByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED)).toBeOnTheScreen();
    expect(screen.queryByTestId(CARD_DELETE_BTN_TEST_ID)).not.toBeOnTheScreen();
  });

  it('disables the card action buttons while the global loading slice is active', async () => {
    mockStore.dispatch(setMockUserId('activity-owner'));
    await renderCard({ userId: 'activity-owner' }, { isShowDeleteBtn: true });

    await act(async () => {
      mockStore.dispatch(startLoading());
    });

    await waitFor(() => {
      const likeButton =
        screen.queryByTestId(CARD_LIKE_BTN_TEST_ID_NOT_LIKED) ?? screen.getByTestId(CARD_LIKE_BTN_TEST_ID_LIKED);
      expect(likeButton).toBeDisabled();
      expect(screen.getByTestId(COMMENT_BTN_TEST_ID)).toBeDisabled();
      expect(screen.getByTestId('iconShareBtn')).toBeDisabled();
      expect(screen.getByTestId(CARD_DELETE_BTN_TEST_ID)).toBeDisabled();
    });

    await act(async () => {
      mockStore.dispatch(finishLoading());
    });
  });
});
