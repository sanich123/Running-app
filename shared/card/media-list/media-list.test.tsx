import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { ROUTES } from '@const/enums';
import { clearSubscriptionSnapshot, setSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { EMOTIONS_BTNS_VALUES } from '@Routes/save-activity-page/emotion-btns/const';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { ActivityCardContext } from '../context';
import MediaList from './media-list';
import type { ActivityCardData } from '../types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@S/custom-image/custom-image', () => ({
  __esModule: true,
  default: (props: { testID?: string; contentFit?: string }) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

const defaultActivity: ActivityCardData = {
  date: '2026-08-09T10:00:00.000Z',
  sport: 'run',
  id: 'activity-id',
  userId: 'activity-owner',
  duration: 0,
  distance: 0,
  elevationGain: 0,
  profile: {},
  commentsLength: 0,
};

function renderMediaList(activity: Partial<ActivityCardData>) {
  return renderWithProviders(
    <ActivityCardContext.Provider
      value={{
        activity: { ...defaultActivity, ...activity },
        isFullView: false,
        isShowDeleteBtn: false,
        isShowDescription: false,
      }}>
      <MediaList />
    </ActivityCardContext.Provider>,
  );
}

describe('media list', () => {
  beforeEach(() => {
    mockStore.dispatch(clearSubscriptionSnapshot());
    mockStore.dispatch(setMockUserId('activity-owner'));
  });

  it('opens the route map when its preview is pressed', async () => {
    const user = userEvent.setup();
    const mapUrl = 'https://cdn.example.test/activity-map-896x538.jpg';
    await renderMediaList({ mapPhotoUrl: mapUrl, media: [] });
    await user.press(screen.getByTestId(mapUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.map}/activity-id`);
  });

  it('shows visible feedback while the map image is being pressed', async () => {
    const mapUrl = 'https://cdn.example.test/activity-map-press.jpg';
    await renderMediaList({ mapPhotoUrl: mapUrl, media: [] });

    const mapTouchTarget = screen.getByRole('button', { name: 'Открыть карту тренировки' });
    await fireEvent(mapTouchTarget, 'pressIn');
    expect(screen.getByTestId('activity-map-press-overlay')).toBeOnTheScreen();

    await fireEvent(mapTouchTarget, 'pressOut');
    expect(screen.queryByTestId('activity-map-press-overlay')).not.toBeOnTheScreen();
  });

  it('keeps the complete map image visible in the card preview', async () => {
    const mapUrl = 'https://cdn.example.test/activity-map-896x538.jpg';
    await renderMediaList({ mapPhotoUrl: mapUrl, media: [] });

    expect(screen.getByTestId(mapUrl).props.contentFit).toBe('cover');
  });

  it('uses the map blurhash and prioritized disk cache for fast scrolling', async () => {
    const mapUrl = 'https://cdn.example.test/activity-map-896x538.jpg';
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
    const mapUrl = 'https://cdn.example.test/activity-map-896x538.jpg';
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
    await renderMediaList({ mapPhotoUrl: 'https://cdn.example.test/activity-map.jpg', media: [] });

    expect(screen.getByTestId('activity-card-add-media-button')).toBeOnTheScreen();
    expect(screen.getByTestId('activity-card-route-replay-button')).toBeOnTheScreen();
  });

  it('shows map actions for users without an active subscription', async () => {
    await renderMediaList({ mapPhotoUrl: 'https://cdn.example.test/activity-map.jpg', media: [] });

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
    await renderMediaList({ mapPhotoUrl: 'https://cdn.example.test/activity-map.jpg', media: [] });

    expect(screen.queryByTestId('activity-card-add-media-button')).not.toBeOnTheScreen();
    expect(screen.getByTestId('activity-card-route-replay-button')).toBeOnTheScreen();
  });

  it('hides route replay from an external viewer when the owner disables it', async () => {
    mockStore.dispatch(setMockUserId('another-user'));
    await renderMediaList({
      mapPhotoUrl: 'https://cdn.example.test/activity-map.jpg',
      media: [],
      profile: { allowActivityReplayViewing: false },
    });

    expect(screen.queryByTestId('activity-card-route-replay-button')).not.toBeOnTheScreen();
  });

  it('continues covering regular photos in the card preview', async () => {
    const photoUrl = 'https://images.example.test/activity.jpg';
    await renderMediaList({ mapPhotoUrl: undefined, media: [{ url: photoUrl, thumbnail: null }] });

    expect(screen.getByTestId(photoUrl).props.contentFit).toBe('cover');
  });

  it('opens the selected activity media', async () => {
    const user = userEvent.setup();
    const photoUrl = 'https://images.example.test/activity.jpg';
    await renderMediaList({ mapPhotoUrl: undefined, media: [{ url: photoUrl, thumbnail: null }] });
    await user.press(screen.getByTestId(photoUrl));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.media}/activity-id?indexOfPhoto=0`);
  });

  it('offers media deletion after a long press only to the activity owner', async () => {
    const media = {
      id: 'media-1',
      activityId: 'activity-id',
      url: 'https://images.example.test/activity.jpg',
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
    await renderMediaList({ mapPhotoUrl: 'https://cdn.example.test/activity-map.jpg', media: [] });

    await fireEvent(screen.getByTestId('activity-map-media-item'), 'longPress');

    expect(screen.queryByTestId('activity-media-delete-button')).not.toBeOnTheScreen();
  });
});
