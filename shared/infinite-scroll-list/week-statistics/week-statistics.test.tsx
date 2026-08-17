import { fireEvent, screen } from '@testing-library/react-native';
import { http } from 'msw';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_SERVER_IDS, MOCK_SERVER_STATISTICS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { WEEK_STATISTICS } from './const';
import WeekStatistics from './week-statistics';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('WeekStatistics', () => {
  beforeEach(() => {
    mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId));
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

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/week`, errorResponse));
    await renderWithProviders(<WeekStatistics />);
    expect(await screen.findAllByText(WEEK_STATISTICS.english.error)).toHaveLength(3);
  });
});
