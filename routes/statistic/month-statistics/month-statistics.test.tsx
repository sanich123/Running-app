import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import MonthStatistics from './month-statistics';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ userId: MOCK_SERVER_IDS.userId, year: '2026', month: '7' }),
}));
jest.mock('../calendar/calendar', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="month-calendar" />;
});

describe('MonthStatistics', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-month`, loadingResponse));
    await renderWithProviders(<MonthStatistics />);
    expect(screen.getByTestId('month-statistics-loading')).toBeOnTheScreen();
  });

  it('renders success state from the server', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<MonthStatistics />);
    expect(await screen.findByTestId('month-calendar')).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-month`, errorResponse));
    await renderWithProviders(<MonthStatistics />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });

  it('uses zero metrics and Russian postfixes when the selected sport is absent', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/year-month`, () =>
        HttpResponse.json({ activities: [], activitiesReducedBySport: {} }),
      ),
    );

    await renderWithProviders(<MonthStatistics />);

    expect(await screen.findByTestId('month-calendar')).toBeOnTheScreen();
  });
});
