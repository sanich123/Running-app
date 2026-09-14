import { screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_PROFILE } from '@T/mocks/mock-location';
import ActivityCard from './card';
import { getCardMapPhotoUrl } from './utils';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { BASE_URL } from '../../tests/utils/handlers';
import { mockStore, setMockUserId } from '../../tests/utils/mock-store';
import { server } from '../../tests/utils/server';
import { renderWithProviders } from '../../tests/utils/test-utils';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => 'somePathname',
}));

describe('Activity card', () => {
  it('resizes the saved square Mapbox image for card dimensions', () => {
    const mapPhotoUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/auto/360x360@2x?access_token=test';

    expect(getCardMapPhotoUrl(mapPhotoUrl, 351)).toBe(
      'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/auto/351x202@2x?access_token=test',
    );
  });

  it('does not load full route locations for a feed card', async () => {
    let requests = 0;
    server.use(
      http.get(`${BASE_URL}/activity/${MOCK_ACTIVITY.id}/locations`, () => {
        requests += 1;
        return HttpResponse.json({ locations: [], kilometresSplit: [] });
      }),
    );

    await renderWithProviders(
      <ActivityCard
        isShowDeleteBtn={false}
        isShowDescription={false}
        title={MOCK_ACTIVITY.title}
        date={MOCK_ACTIVITY.date}
        sport={MOCK_ACTIVITY.sport as SPORTS_BTNS_VALUES}
        id={MOCK_ACTIVITY.id}
        userId={MOCK_ACTIVITY.userId}
        mapPhotoUrl="https://api.mapbox.com/styles/v1/map.png"
        duration={MOCK_ACTIVITY.duration}
        distance={MOCK_ACTIVITY.distance}
        elevationGain={MOCK_ACTIVITY.elevationGain}
        profile={MOCK_PROFILE}
        commentsLength={0}
      />,
    );

    expect(requests).toBe(0);
  });

  it('keeps the saved map preview in the full view', async () => {
    const mapPhotoUrl = 'https://cdn.example.test/activity-map.jpg';

    await renderWithProviders(
      <ActivityCard
        isFullView
        isShowDeleteBtn={false}
        isShowDescription={false}
        title={MOCK_ACTIVITY.title}
        date={MOCK_ACTIVITY.date}
        sport={MOCK_ACTIVITY.sport as SPORTS_BTNS_VALUES}
        id={MOCK_ACTIVITY.id}
        userId={MOCK_ACTIVITY.userId}
        mapPhotoUrl={mapPhotoUrl}
        duration={MOCK_ACTIVITY.duration}
        distance={MOCK_ACTIVITY.distance}
        elevationGain={MOCK_ACTIVITY.elevationGain}
        profile={MOCK_PROFILE}
        commentsLength={0}
      />,
    );

    await waitFor(() => expect(screen.getAllByTestId(mapPhotoUrl)).toHaveLength(2));
  });

  it('should correctly renders', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    const { description, title, date, sport, id, photoVideoUrls, profile, duration, distance } = MOCK_ACTIVITY;
    await renderWithProviders(
      <ActivityCard
        isShowDeleteBtn
        isShowDescription
        description={description}
        title={title}
        date={`${new Date(date)}`}
        sport={sport as SPORTS_BTNS_VALUES}
        id={id}
        userId="someUserId"
        photoVideoUrls={photoVideoUrls}
        duration={duration}
        distance={distance}
        elevationGain={MOCK_ACTIVITY.elevationGain}
        profile={MOCK_PROFILE}
        commentsLength={6}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(new RegExp(`${profile.name}`))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`${profile.surname}`))).toBeOnTheScreen();
    expect(await screen.findAllByText(title)).toHaveLength(2);
    ['Time', 'Pace', 'Distance'].map(async (word) =>
      expect(await screen.getAllByText(new RegExp(word))).toHaveLength(2),
    );
  });
});
