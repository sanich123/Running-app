import { act, screen, userEvent, waitFor, within } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { http, HttpResponse } from 'msw';
import { captureRef } from 'react-native-view-shot';
import { LANGUAGES } from '@const/enums';
import { finishLoading, resetLoading, startLoading } from '@R/slices/loading/loading';
import { changeLanguage } from '@R/slices/settings/settings';
import { clearSubscriptionSnapshot, setSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import ActivityCard from './card';
import { COMMENT_BTN_TEST_ID } from './comment-btn/const';
import { CARD_DELETE_BTN_TEST_ID } from './delete-btn/const';
import { CARD_LIKE_BTN_TEST_ID_LIKED, CARD_LIKE_BTN_TEST_ID_NOT_LIKED } from './like-btn/const';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { BASE_URL } from '../../tests/utils/handlers';
import { mockStore, setMockUserId } from '../../tests/utils/mock-store';
import { server } from '../../tests/utils/server';
import { renderWithProviders } from '../../tests/utils/test-utils';
import type { ActivityCardData, ActivityCardProps } from './types';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

describe('Activity card', () => {
  beforeEach(() => {
    mockStore.dispatch(clearSubscriptionSnapshot());
    mockStore.dispatch(resetLoading());
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
  });

  it('renders the share image only while sharing', async () => {
    const user = userEvent.setup();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
    (captureRef as jest.Mock).mockResolvedValue('snapshot.png');

    await renderCard({
      title: 'Morning run',
      date: '2026-08-09T10:00:00.000Z',
      sport: 'run',
      id: 'activity-1',
      userId: 'user-1',
      duration: 300000,
      distance: 5000,
      elevationGain: 0,
      media: [],
    });

    expect(screen.queryByText('runich')).not.toBeOnTheScreen();
    await user.press(screen.getByTestId('iconShareBtn'));
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
