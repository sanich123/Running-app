import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_SERVER_IDS, MOCK_SERVER_STATISTICS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { WEEK_STATISTICS } from './const';
import WeekStatistics from './week-statistics';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('WeekStatistics', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
  });

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/week`, loadingResponse));
    await renderWithProviders(<WeekStatistics />);
    expect(screen.getByText(WEEK_STATISTICS.english.report)).toBeOnTheScreen();
    expect(screen.queryByText(`${MOCK_SERVER_STATISTICS.week.totalItems}`)).not.toBeOnTheScreen();
  });

  it('renders success and navigates to the monthly report', async () => {
    await renderWithProviders(<WeekStatistics />);
    expect(await screen.findByText(`${MOCK_SERVER_STATISTICS.week.totalItems}`)).toBeOnTheScreen();
    fireEvent.press(screen.getByText(WEEK_STATISTICS.english.report));
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('renders localized metric units in Russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<WeekStatistics />);

    expect(await screen.findByText(`${MOCK_SERVER_STATISTICS.week.totalItems}`)).toBeOnTheScreen();
    expect(screen.getByText('Тренировки')).toBeOnTheScreen();
    expect(screen.getByText('0ч 1мин')).toBeOnTheScreen();
    expect(screen.getByText('138 км')).toBeOnTheScreen();
  });

  it('renders fallback metric values and does not navigate for an empty report', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/week`, () => HttpResponse.json({})));
    await renderWithProviders(<WeekStatistics />);

    expect(await screen.findByText('0')).toBeOnTheScreen();
    expect(screen.getByText('0h 0min')).toBeOnTheScreen();
    expect(screen.getByText('0 km')).toBeOnTheScreen();

    fireEvent.press(screen.getByText(WEEK_STATISTICS.english.report));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders a compact error state and retries the request', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/week`, () => {
        requestCount += 1;
        return requestCount === 1 ? errorResponse() : HttpResponse.json(MOCK_SERVER_STATISTICS.week);
      }),
    );
    await renderWithProviders(<WeekStatistics />);

    expect(await screen.findByText(WEEK_STATISTICS.english.errorMessage)).toBeOnTheScreen();
    expect(screen.queryByText(WEEK_STATISTICS.english.error)).not.toBeOnTheScreen();

    const user = userEvent.setup();
    await user.press(screen.getByText(WEEK_STATISTICS.english.errorMessage));

    expect(await screen.findByText(`${MOCK_SERVER_STATISTICS.week.totalItems}`)).toBeOnTheScreen();
    expect(requestCount).toBe(2);
  });
});
