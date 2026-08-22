import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { getAverageCadence, getSpeedInKmPerHour } from '@U/location/location-utils';
import { HOME_ACTIVITY_FULL_VIEW_TEST_ID, HOME_ACTIVITY_FULL_VIEW } from './const';
import Metrics from './metrics';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: 'someActivityId',
  }),
}));

describe('Home activity full view', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<Metrics />, { store: mockStore });
    expect(screen.getByTestId(HOME_ACTIVITY_FULL_VIEW_TEST_ID)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.distance)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.averagePace)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.movingTime)).toBeOnTheScreen();
    expect(await screen.findByText('00:58:34')).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.elevationGain)).toBeOnTheScreen();
    expect(await screen.findByText('21 m')).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.averageCadence)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<Metrics />, { store: mockStore });
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.distance)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.averagePace)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.movingTime)).toBeOnTheScreen();
    expect(await screen.findByText('00:58:34')).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.elevationGain)).toBeOnTheScreen();
    expect(await screen.findByText(new RegExp(`21 ${HOME_ACTIVITY_FULL_VIEW.russian.m}`))).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.russian.averageCadence)).toBeOnTheScreen();
  });

  it('shows walking speed and total steps as separate metrics', async () => {
    server.use(
      http.get(`${BASE_URL}/activity/activityId/someActivityId`, () =>
        HttpResponse.json({ ...MOCK_ACTIVITY, sport: 'walk', steps: 1234 }),
      ),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));

    await renderWithProviders(<Metrics />, { store: mockStore });

    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.averageSpeed)).toBeOnTheScreen();
    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.steps)).toBeOnTheScreen();
    expect(
      await screen.findByText(`${getSpeedInKmPerHour(MOCK_ACTIVITY.distance, MOCK_ACTIVITY.duration).toFixed(1)} km/h`),
    ).toBeOnTheScreen();
    expect(await screen.findByText('1234')).toBeOnTheScreen();
    expect(screen.queryByText(HOME_ACTIVITY_FULL_VIEW.english.averagePace)).not.toBeOnTheScreen();
  });

  it('shows average cadence for running', async () => {
    const steps = 1200;
    server.use(
      http.get(`${BASE_URL}/activity/activityId/someActivityId`, () =>
        HttpResponse.json({ ...MOCK_ACTIVITY, sport: 'run', steps }),
      ),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));

    await renderWithProviders(<Metrics />, { store: mockStore });

    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.averageCadence)).toBeOnTheScreen();
    expect(
      await screen.findByText(`${getAverageCadence(steps, MOCK_ACTIVITY.duration)} spm`),
    ).toBeOnTheScreen();
  });

  it.each(['hike', 'ride'])('shows kilometres per hour for %s', async (sport) => {
    server.use(
      http.get(`${BASE_URL}/activity/activityId/someActivityId`, () =>
        HttpResponse.json({ ...MOCK_ACTIVITY, sport }),
      ),
    );
    mockStore.dispatch(changeLanguage(LANGUAGES.english));

    await renderWithProviders(<Metrics />, { store: mockStore });

    expect(await screen.findByText(HOME_ACTIVITY_FULL_VIEW.english.averageSpeed)).toBeOnTheScreen();
    expect(
      await screen.findByText(`${getSpeedInKmPerHour(MOCK_ACTIVITY.distance, MOCK_ACTIVITY.duration).toFixed(1)} km/h`),
    ).toBeOnTheScreen();
    expect(screen.queryByText(HOME_ACTIVITY_FULL_VIEW.english.averagePace)).not.toBeOnTheScreen();
  });
});
