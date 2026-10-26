import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { FlatList, Platform, StyleSheet } from 'react-native';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { clearSubscriptionSnapshot, setSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import * as errorToastModule from '@S/error-toast/error-toast';
import * as infoToastModule from '@S/info-toast/info-toast';
import { DEFAULT_ACTIVITY_CARD, TEST_URLS } from '@T/mocks/const';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { MEDIA_MODERATION_PLACEHOLDER_COPY } from '../../media-moderation-placeholder/const';
import { ActivityCardContext } from '../context';
import { ACTIVITY_MEDIA_COPY } from './activity-media-item/const';
import MediaList from './media-list';
import VideoPlaybackProvider from './video-playback-provider/video-playback-provider';
import type { ActivityCardData } from '../types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useIsFocused: () => true,
}));
jest.mock('@S/custom-image/custom-image', () => ({
  __esModule: true,
  default: (props: { testID?: string; contentFit?: string }) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));
jest.mock('@S/moderation/content-actions-menu/content-actions-menu', () => ({
  __esModule: true,
  default: jest.requireActual('@S/moderation/content-actions-menu/content-actions-menu.tsx').default,
}));
jest.mock('@S/moderation/content-actions-menu/content-actions-menu.ios', () => ({
  __esModule: true,
  default: jest.requireActual('@S/moderation/content-actions-menu/content-actions-menu.tsx').default,
}));

function renderMediaList(activity: Partial<ActivityCardData>, isFullView = false) {
  return renderWithProviders(
    <VideoPlaybackProvider>
      <ActivityCardContext.Provider
        value={{
          activity: { ...DEFAULT_ACTIVITY_CARD, ...activity },
          isFullView,
          isShowDescription: false,
        }}>
        <MediaList />
      </ActivityCardContext.Provider>
    </VideoPlaybackProvider>,
  );
}

function overridePlatformOS(os: typeof Platform.OS) {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
  return () => Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
}

describe('media list', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockStore.dispatch(clearSubscriptionSnapshot());
    mockStore.dispatch(setMockUserId('activity-owner'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
  });

  it('opens the route map when its preview is pressed', async () => {
    const user = userEvent.setup();
    const mapUrl = TEST_URLS.activityCardMapWithDimensions;
    await renderMediaList({ mapPhotoUrl: mapUrl, media: [] });
    await user.press(screen.getByTestId(mapUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/activity-id`);
  });

  it('lets the activity owner add the map activity to favorites', async () => {
    let requestBody: unknown;
    server.use(
      http.patch(BASE_URL + '/activity/:activityId/favorite', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'activity-id', isFavorite: true });
      }),
    );
    const user = userEvent.setup();
    await renderMediaList({ mapPhotoUrl: 'https://cdn.example.test/favorite-map.jpg', media: [], isFavorite: false });

    const favoriteButton = screen.getByTestId('activity-favorite-button');
    expect(favoriteButton).toHaveProp('accessibilityLabel', 'Добавить в избранное');
    await user.press(favoriteButton);

    await waitFor(() => expect(requestBody).toEqual({ isFavorite: true }));
  });

  it('keeps the selected favorite star in its current highlighted style', async () => {
    await renderMediaList({
      mapPhotoUrl: 'https://cdn.example.test/selected-favorite-map.jpg',
      media: [],
      isFavorite: true,
    });

    const favoriteButton = screen.getByTestId('activity-favorite-button');
    expect(favoriteButton).toHaveProp('accessibilityLabel', 'Убрать из избранного');
    expect(favoriteButton).toBeOnTheScreen();
  });

  it('hides the favorite action from an external viewer', async () => {
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({ mapPhotoUrl: 'https://cdn.example.test/external-map.jpg', media: [], isFavorite: true });

    expect(screen.queryByTestId('activity-favorite-button')).not.toBeOnTheScreen();
  });

  it('keeps the complete map image visible in the card preview', async () => {
    const mapUrl = TEST_URLS.activityCardMapWithDimensions;
    await renderMediaList({ mapPhotoUrl: mapUrl, media: [] });

    expect(screen.getByTestId(mapUrl).props.contentFit).toBe('cover');
  });

  it('keeps the full-size map first and scrolls it left to reveal activity media in the card preview', async () => {
    const mapUrl = TEST_URLS.activityCardMap;
    const routeOnlyMapUrl = 'https://cdn.example.test/activity-route-only-map.jpg';
    const photoUrl = TEST_URLS.imageActivityPhoto;
    await renderMediaList({
      mapPhotoUrl: mapUrl,
      routeOnlyMapPhotoUrl: routeOnlyMapUrl,
      media: [{ url: photoUrl, thumbnail: null }],
    });

    const scrollToOffset = jest.spyOn(FlatList.prototype, 'scrollToOffset').mockImplementation(() => undefined);
    const mediaList = screen.getByTestId('activity-media-list');
    const mapTileWidth = StyleSheet.flatten(screen.getByTestId('activity-map-media-container').props.style).width;
    const mapImageStyle = StyleSheet.flatten(screen.getByTestId(mapUrl).props.style);
    const photoWidth = StyleSheet.flatten(screen.getByTestId(photoUrl).props.style).width;

    expect(mediaList.props.horizontal).toBe(true);
    expect(mediaList.props.data.map(({ url }: { url: string }) => url)).toEqual([mapUrl, photoUrl]);
    expect(screen.getByTestId(mapUrl)).toBeOnTheScreen();
    expect(screen.getByTestId(photoUrl)).toBeOnTheScreen();
    expect(screen.queryByTestId(routeOnlyMapUrl)).not.toBeOnTheScreen();
    expect(screen.getByTestId(mapUrl)).toHaveProp('contentFit', 'cover');
    expect(screen.getByTestId(photoUrl)).toHaveProp('contentFit', 'cover');
    expect(mapImageStyle.width).toBe(mapTileWidth);
    expect(mapImageStyle.transform).toBeUndefined();
    expect(photoWidth).toBeLessThan(mapTileWidth);
    expect(mediaList.props.onContentSizeChange).toEqual(expect.any(Function));

    try {
      mediaList.props.onContentSizeChange(1000, 220);
      mediaList.props.onContentSizeChange(1000, 220);

      expect(scrollToOffset).toHaveBeenCalledTimes(1);
      expect(scrollToOffset).toHaveBeenCalledWith({ offset: mapTileWidth / 2, animated: false });
    } finally {
      scrollToOffset.mockRestore();
    }
  });

  it('does not apply the card preview offset in full view', async () => {
    const scrollToOffset = jest.spyOn(FlatList.prototype, 'scrollToOffset').mockImplementation(() => undefined);
    try {
      await renderMediaList(
        {
          mapPhotoUrl: 'https://cdn.example.test/full-view-map.jpg',
          media: [{ url: 'https://images.example.test/full-view-photo.jpg', thumbnail: null }],
        },
        true,
      );

      screen.getByTestId('activity-media-list').props.onContentSizeChange(1000, 220);

      expect(scrollToOffset).not.toHaveBeenCalled();
    } finally {
      scrollToOffset.mockRestore();
    }
  });

  it('shows an owner the full map when map visibility is restricted', async () => {
    const mapUrl = TEST_URLS.activityCardPrivateFullMap;
    const routeOnlyMapUrl = TEST_URLS.activityCardRouteOnlyMap;
    await renderMediaList({ mapPhotoUrl: mapUrl, routeOnlyMapPhotoUrl: routeOnlyMapUrl, hideMap: true, media: [] });

    expect(screen.getByTestId(mapUrl)).toBeOnTheScreen();
    expect(screen.queryByTestId(routeOnlyMapUrl)).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('activity-map-media-item'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/activity-id`);
  });

  it('shows an external viewer only the route map and disables its map actions', async () => {
    mockStore.dispatch(setMockUserId('another-user'));
    const mapUrl = TEST_URLS.activityCardPrivateFullMap;
    const routeOnlyMapUrl = TEST_URLS.activityCardRouteOnlyMap;
    await renderMediaList({
      mapPhotoUrl: mapUrl,
      routeOnlyMapPhotoUrl: routeOnlyMapUrl,
      mapPhotoUrlBlurhash: 'private-map-blurhash',
      hideMap: true,
      media: [],
    });

    expect(screen.getByTestId(routeOnlyMapUrl)).toBeOnTheScreen();
    expect(screen.getByTestId(routeOnlyMapUrl).props.placeholder).toBeNull();
    expect(screen.queryByTestId(mapUrl)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-card-route-replay-button')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('activity-map-media-item'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not expose a full map to an external viewer without a route preview', async () => {
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({
      mapPhotoUrl: TEST_URLS.activityCardPrivateFullMap,
      routeOnlyMapPhotoUrl: undefined,
      hideMap: true,
      media: [],
    });

    expect(screen.queryByTestId('activity-media-list')).not.toBeOnTheScreen();
  });

  it('falls back to the route map for the owner when a full map is unavailable', async () => {
    const routeOnlyMapUrl = TEST_URLS.activityCardRouteOnlyMap;
    await renderMediaList({ mapPhotoUrl: undefined, routeOnlyMapPhotoUrl: routeOnlyMapUrl, hideMap: true, media: [] });

    expect(screen.getByTestId(routeOnlyMapUrl)).toBeOnTheScreen();
  });

  it('omits the media list when no map or activity media is available', async () => {
    await renderMediaList({ mapPhotoUrl: undefined, media: [] });

    expect(screen.queryByTestId('activity-media-list')).not.toBeOnTheScreen();
  });

  it('uses inset spacing and rounded media tiles like the reference card', async () => {
    const mapUrl = 'https://cdn.example.test/activity-map-rounded.jpg';
    await renderMediaList({ mapPhotoUrl: mapUrl, media: [] });

    expect(StyleSheet.flatten(screen.getByTestId('activity-map-media-container').props.style)).toEqual(
      expect.objectContaining({ borderRadius: 10, overflow: 'hidden' }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('activity-media-list').props.contentContainerStyle)).toEqual(
      expect.objectContaining({ paddingVertical: 4 }),
    );
  });

  it('keeps web media-list height aligned with its media tiles', async () => {
    const restorePlatform = overridePlatformOS('web');

    try {
      await renderMediaList({ mapPhotoUrl: 'https://cdn.example.test/activity-map-web.jpg', media: [] });

      const mediaHeight = StyleSheet.flatten(screen.getByTestId('activity-map-media-container').props.style).height;
      const listStyle = StyleSheet.flatten(screen.getByTestId('activity-media-list').props.style);

      expect(listStyle.height).toBe(mediaHeight + 8);
      expect(listStyle.flexGrow).toBe(0);
    } finally {
      restorePlatform();
    }
  });

  it('uses the map blurhash and prioritized disk cache for fast scrolling', async () => {
    const mapUrl = TEST_URLS.activityCardMapWithDimensions;
    await renderMediaList({ mapPhotoUrl: mapUrl, mapPhotoUrlBlurhash: 'map-blurhash', media: [] });

    expect(screen.getByTestId(mapUrl).props).toEqual(
      expect.objectContaining({
        placeholder: 'map-blurhash',
        placeholderContentFit: 'cover',
        priority: 'high',
        cachePolicy: 'memory-disk',
        recyclingKey: mapUrl,
      }),
    );
  });

  it('renders location and weather over the map preview', async () => {
    const mapUrl = TEST_URLS.activityCardMapWithDimensions;
    await renderMediaList({
      mapPhotoUrl: mapUrl,
      media: [],
      locationName: 'Очень длинное название населённого пункта',
      weatherTemperature: 18,
      weatherWindSpeed: 6,
      weatherCode: 0,
      emotion: EMOTIONS_BTNS_VALUES.good,
    });

    expect(screen.getByText('Очень длинное название населённого пункта')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText('Очень длинное название населённого пункта')).toHaveProp('ellipsizeMode', 'tail');
    expect(screen.getByText('18°C')).toBeOnTheScreen();
    expect(screen.getByText('6 м/с')).toBeOnTheScreen();
    expect(screen.getByTestId('map-emotion-icon')).toBeOnTheScreen();
  });

  it('renders map actions over the bottom-right corner of the map image', async () => {
    mockStore.dispatch(
      setSubscriptionSnapshot({
        userId: 'activity-owner',
        isPremium: true,
        status: 'active',
        provider: 'manual',
        productId: 'annual',
        startsAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2027-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      }),
    );
    await renderMediaList({ mapPhotoUrl: TEST_URLS.activityCardMap, media: [] });

    expect(screen.getByTestId('activity-card-add-media-button')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-card-route-replay-button')).toBeOnTheScreen();
  });

  it('shows map actions for users without an active subscription', async () => {
    await renderMediaList({ mapPhotoUrl: TEST_URLS.activityCardMap, media: [] });

    expect(screen.getByTestId('activity-card-add-media-button')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-card-route-replay-button')).toBeOnTheScreen();
  });

  it('only shows the upload action to the activity owner', async () => {
    mockStore.dispatch(
      setSubscriptionSnapshot({
        userId: 'another-user',
        isPremium: true,
        status: 'active',
        provider: 'manual',
        productId: 'annual',
        startsAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2027-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      }),
    );
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({ mapPhotoUrl: TEST_URLS.activityCardMap, media: [] });

    expect(screen.queryByTestId('activity-card-add-media-button')).not.toBeOnTheScreen();
    expect(screen.getByTestId('activity-card-route-replay-button')).toBeOnTheScreen();
  });

  it('hides route replay from an external viewer when the owner disables it', async () => {
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({
      mapPhotoUrl: TEST_URLS.activityCardMap,
      media: [],
      profile: { allowActivityReplayViewing: false },
    });

    expect(screen.queryByTestId('activity-card-route-replay-button')).not.toBeOnTheScreen();
  });

  it('continues covering regular photos in the card preview', async () => {
    const photoUrl = TEST_URLS.activityPhoto;
    await renderMediaList({ mapPhotoUrl: undefined, media: [{ url: photoUrl, thumbnail: null }] });

    expect(screen.getByTestId(photoUrl).props.contentFit).toBe('cover');
  });

  it('hides the review status from the activity owner while keeping its photo tile', async () => {
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [{ id: 'pending-media', assetId: 'asset-1', thumbnail: null, mediaReviewStatus: 'review_required' }],
    });

    expect(screen.getByTestId('pending-activity-media-pending-media')).toBeOnTheScreen();
    expect(screen.queryByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].reviewRequired)).toBeNull();
    expect(screen.queryByTestId('media-moderation-placeholder')).not.toBeOnTheScreen();
  });

  it('shows a stage icon to viewers and explains the stage in a toast', async () => {
    mockStore.dispatch(setMockUserId('subscriber'));
    const infoToast = jest.spyOn(infoToastModule, 'infoToast').mockImplementation(() => undefined);
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [
        {
          id: 'pending-photo',
          url: 'https://cdn.example.test/pending.jpg',
          thumbnail: null,
          mediaReviewStatus: 'queued',
        },
      ],
    });

    const statusButton = screen.getByTestId('media-moderation-placeholder');
    expect(statusButton).toHaveProp('accessibilityLabel', MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].queued);
    await userEvent.press(statusButton);
    expect(infoToast).toHaveBeenCalledWith(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].queued);
    infoToast.mockRestore();
  });

  it('hides an uploaded photo stage icon from the activity owner', async () => {
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [
        {
          id: 'owned-pending-photo',
          url: 'https://cdn.example.test/owned-pending.jpg',
          thumbnail: null,
          mediaReviewStatus: 'processing',
        },
      ],
    });

    expect(screen.queryByTestId('media-moderation-placeholder')).not.toBeOnTheScreen();
  });

  it('uses the media position as a stable placeholder identifier before the server assigns an id', async () => {
    await renderMediaList({
      media: [{ thumbnail: null, mediaReviewStatus: 'queued' }],
    });

    expect(screen.getByTestId('activity-media-0')).toBeOnTheScreen();
    expect(screen.getByTestId('pending-activity-media-0')).toBeOnTheScreen();
    expect(screen.queryByText(MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].queued)).toBeNull();
  });

  it('shows a moderation overlay for media without an uploaded preview to viewers', async () => {
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [{ id: 'pending-media-without-preview', thumbnail: null, mediaReviewStatus: 'processing' }],
    });

    expect(screen.getByTestId('pending-activity-media-pending-media-without-preview')).toBeOnTheScreen();
    expect(screen.getByTestId('media-moderation-placeholder')).toHaveProp(
      'accessibilityLabel',
      MEDIA_MODERATION_PLACEHOLDER_COPY[LANGUAGES.russian].processing,
    );
  });

  it('removes the media area from the card when every item was rejected', async () => {
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [
        {
          id: 'rejected-video',
          url: 'https://images.example.test/rejected-video.mp4',
          thumbnail: 'https://images.example.test/rejected-video.jpg',
          mediaReviewStatus: 'rejected',
        },
      ],
    });

    expect(screen.queryByTestId('activity-media-list')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-media-rejected-video')).not.toBeOnTheScreen();
  });

  it("opens the native action menu and submits a report for another user's media", async () => {
    const user = userEvent.setup();
    const receivedReports: unknown[] = [];
    mockStore.dispatch(setMockUserId('viewer-user'));
    server.use(
      http.post(BASE_URL + '/moderation/reports', async ({ request }) => {
        receivedReports.push(await request.json());
        return HttpResponse.json({ id: 'report-1', status: 'open' }, { status: 201 });
      }),
    );
    const restorePlatform = overridePlatformOS('android');
    try {
      await renderMediaList({
        mapPhotoUrl: undefined,
        media: [{ id: 'reported-media', url: 'https://cdn.example.test/report.jpg', thumbnail: null }],
      });

      await user.press(screen.getByTestId('media-actions-menu-reported-media'));
      await user.press(await screen.findByTestId('report-media-reported-media'));
      await user.press(screen.getByText('Отправить'));

      await waitFor(() =>
        expect(receivedReports).toEqual([{ targetType: 'media', targetId: 'reported-media', reason: 'harassment' }]),
      );
    } finally {
      restorePlatform();
    }
  });

  it('starts videos on request, muted, and exposes duration and a mute toggle', async () => {
    const user = userEvent.setup();
    const media = {
      id: 'video-1',
      url: 'https://images.example.test/activity.mp4',
      thumbnail: 'https://images.example.test/activity-thumb.jpg',
    };

    await renderMediaList({ mapPhotoUrl: undefined, media: [media] });

    expect(screen.getByTestId('activity-video-video-1')).toBeOnTheScreen();
    const playButton = screen.getByTestId('activity-video-video-1-play');
    expect(playButton).toHaveProp('accessibilityLabel', ACTIVITY_MEDIA_COPY[LANGUAGES.russian].playVideo);
    await user.press(playButton);
    expect(playButton).toHaveProp('accessibilityLabel', 'Приостановить видео');
    expect(screen.getByText('0:13')).toBeOnTheScreen();
    const muteButton = screen.getByTestId('activity-video-video-1-mute');
    expect(muteButton).toHaveProp('accessibilityLabel', 'Включить звук видео');
    expect(
      StyleSheet.flatten(
        screen.getByTestId('activity-video-video-1-mute-icon', { includeHiddenElements: true }).props.style,
      ),
    ).toEqual(expect.objectContaining({ color: '#fff' }));

    await user.press(muteButton);

    expect(muteButton).toHaveProp('accessibilityLabel', 'Выключить звук видео');
  });

  it('opens the selected activity media', async () => {
    const user = userEvent.setup();
    const photoUrl = TEST_URLS.activityPhoto;
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [{ url: photoUrl, thumbnail: null, blurhash: 'card-photo-blurhash' }],
    });
    await user.press(screen.getByTestId(photoUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/activity-id?indexOfPhoto=0&blurhash=card-photo-blurhash`);
  });

  it('opens a video on web without nesting its control buttons', async () => {
    const restorePlatform = overridePlatformOS('web');
    const videoUrl = 'https://images.example.test/activity video.mp4';

    try {
      await renderMediaList({
        mapPhotoUrl: undefined,
        media: [{ id: 'video-web', url: videoUrl, thumbnail: 'activity-video-thumb.jpg' }],
      });

      fireEvent(screen.getByTestId('activity-media-video-web'), 'click');

      expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/${encodeURIComponent(videoUrl)}?indexOfPhoto=0`);
    } finally {
      restorePlatform();
    }
  });

  it('uses English media labels and an encoded URL on web', async () => {
    const restorePlatform = overridePlatformOS('web');
    const user = userEvent.setup();
    const photoUrl = 'https://images.example.test/activity photo.jpg';
    mockStore.dispatch(changeLanguage(LANGUAGES.english));

    try {
      await renderMediaList({ mapPhotoUrl: undefined, media: [{ url: photoUrl, thumbnail: null }] });
      const mediaButton = screen.getByRole('button', { name: 'Open activity media' });
      await user.press(mediaButton);
      expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/${encodeURIComponent(photoUrl)}?indexOfPhoto=0`);
    } finally {
      restorePlatform();
    }
  });

  it('updates photo dimensions for valid metadata and toggles delete without navigating after long press', async () => {
    const photoUrl = 'https://images.example.test/activity-metadata.jpg';
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [{ id: 'media-metadata', url: photoUrl, thumbnail: null }],
    });
    const media = screen.getByTestId(photoUrl);
    const touchTarget = screen.getByTestId('activity-media-media-metadata');
    const initialWidth = StyleSheet.flatten(screen.getByTestId(photoUrl).props.style).width;

    await fireEvent(media, 'load', { source: { width: 0, height: 100 } });
    expect(StyleSheet.flatten(screen.getByTestId(photoUrl).props.style).width).toBe(initialWidth);

    await fireEvent(media, 'load', { source: { width: 200, height: 100 } });
    expect(StyleSheet.flatten(screen.getByTestId(photoUrl).props.style).width).not.toBe(initialWidth);

    const longPressMedia = async () => {
      await fireEvent(touchTarget, 'longPress');
    };

    await longPressMedia();

    expect(screen.getByTestId('activity-media-delete-button')).toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();

    await longPressMedia();

    expect(screen.queryByTestId('activity-media-delete-button')).not.toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('uses the mobile width cap and handles a map without a media array', async () => {
    const useWindowDimensions = jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: MAX_MOBILE_WIDTH + 200,
      height: 800,
      scale: 1,
      fontScale: 1,
    });
    const mapUrl = 'https://cdn.example.test/wide-map.jpg';

    try {
      await renderMediaList({ mapPhotoUrl: mapUrl, media: undefined });
      expect(screen.getByTestId(mapUrl)).toHaveProp('style', expect.objectContaining({ width: MAX_MOBILE_WIDTH }));

      useWindowDimensions.mockReturnValue({ width: 320, height: 800, scale: 1, fontScale: 1 });
      const narrowMapUrl = 'https://cdn.example.test/narrow-map.jpg';
      await renderMediaList({ mapPhotoUrl: narrowMapUrl, media: [] });
      expect(screen.getByTestId(narrowMapUrl)).toHaveProp('style', expect.objectContaining({ width: 320 }));
    } finally {
      useWindowDimensions.mockRestore();
    }
  });

  it('uses English video labels', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [
        {
          id: 'video-english',
          url: 'https://images.example.test/english.mp4',
          thumbnail: 'https://images.example.test/english-thumb.jpg',
        },
      ],
    });

    expect(screen.getByTestId('activity-video-video-english-mute')).toHaveProp('accessibilityLabel', 'Unmute video');
  });

  it('uses a supplied thumbnail for a regular photo', async () => {
    const photoUrl = 'https://images.example.test/second.jpg';
    await renderMediaList({
      mapPhotoUrl: undefined,
      media: [{ url: photoUrl, thumbnail: 'second-thumb.jpg' }],
    });

    expect(screen.getByTestId(photoUrl)).toHaveProp('source', { uri: 'second-thumb.jpg' });
  });

  it('reports a forbidden route preview tap instead of navigating', async () => {
    const errorToastSpy = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({
      mapPhotoUrl: 'https://cdn.example.test/hidden-map.jpg',
      media: [],
      profile: { allowActivityReplayViewing: false },
    });

    await fireEvent.press(screen.getByTestId('activity-map-media-item'));

    expect(errorToastSpy).toHaveBeenCalledWith('Пользователь запретил просматривать информацию о своем маршруте');
    expect(mockPush).not.toHaveBeenCalled();
    errorToastSpy.mockRestore();
  });

  it('offers media deletion after a long press only to the activity owner', async () => {
    const media = {
      id: 'media-1',
      activityId: 'activity-id',
      url: TEST_URLS.activityPhoto,
      thumbnail: null,
    };
    await renderMediaList({ mapPhotoUrl: undefined, media: [media] });

    await fireEvent(screen.getByTestId(`activity-media-${media.id}`), 'longPress');

    expect(screen.getByTestId('activity-media-delete-button')).toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not offer media deletion to users viewing another activity', async () => {
    const media = {
      id: 'media-2',
      activityId: 'activity-id',
      url: 'https://images.example.test/another-activity.jpg',
      thumbnail: null,
    };
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({ mapPhotoUrl: undefined, media: [media] });

    await fireEvent(screen.getByTestId(`activity-media-${media.id}`), 'longPress');

    expect(screen.queryByTestId('activity-media-delete-button')).not.toBeOnTheScreen();
  });

  it('does not offer media deletion for the activity map', async () => {
    await renderMediaList({ mapPhotoUrl: TEST_URLS.activityCardMap, media: [] });

    await fireEvent(screen.getByTestId('activity-map-media-item'), 'longPress');

    expect(screen.queryByTestId('activity-media-delete-button')).not.toBeOnTheScreen();
  });
});
