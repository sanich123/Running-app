import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityStatisticsPage from './activity-statistics-page';
import { ACTIVITY_STATISTICS_PAGE_COPY } from './const';

const ACTIVITY_IDS = {
  loading: 'statistics-loading',
  error: 'statistics-error',
  success: 'statistics-success',
} as const;
const mockRouteParams = jest.fn((): { id: string } => ({ id: ACTIVITY_IDS.success }));

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => mockRouteParams(),
}));
jest.mock('@S/cross-platform-layout/cross-platform-layout', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});
jest.mock('@S/error-component/error-component', () => {
  const { Pressable } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ refetch }: { refetch: () => void }) => (
      <Pressable testID="activity-statistics-retry" onPress={refetch} />
    ),
  };
});

describe('ActivityStatisticsPage', () => {
  const copy = ACTIVITY_STATISTICS_PAGE_COPY[LANGUAGES.english];

  beforeEach(() => {
    mockRouteParams.mockReturnValue({ id: ACTIVITY_IDS.success });
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('viewer-1'));
  });

  it('shows loading in preference to stale activity or error state', async () => {
    mockRouteParams.mockReturnValue({ id: ACTIVITY_IDS.loading });
    server.use(http.get(`${BASE_URL}/activity/activityId/${ACTIVITY_IDS.loading}`, loadingResponse));

    await renderWithProviders(<ActivityStatisticsPage />, { store: mockStore });

    expect(screen.getByTestId('activity-statistics-loader')).toBeOnTheScreen();
    expect(screen.queryByText(copy.duration)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-statistics-retry')).not.toBeOnTheScreen();
  });

  it('shows the error state before cached activity content and retries on tap', async () => {
    mockRouteParams.mockReturnValue({ id: ACTIVITY_IDS.error });
    const requests: string[] = [];
    server.use(
      http.get(`${BASE_URL}/activity/activityId/${ACTIVITY_IDS.error}`, ({ request }) => {
        requests.push(request.url);
        return errorResponse();
      }),
    );

    await renderWithProviders(<ActivityStatisticsPage />, { store: mockStore });
    await waitFor(() => expect(requests).toHaveLength(1));
    await waitFor(() => expect(screen.getByTestId('activity-statistics-retry')).toBeOnTheScreen());
    await userEvent.press(screen.getByTestId('activity-statistics-retry'));

    await waitFor(() => expect(requests).toHaveLength(2));
    expect(screen.queryByText(copy.duration)).not.toBeOnTheScreen();
  });

  it('renders the activity statistics and kilometer splits after loading', async () => {
    server.use(
      http.get(`${BASE_URL}/activity/activityId/${ACTIVITY_IDS.success}`, () => HttpResponse.json(MOCK_ACTIVITY)),
    );

    await renderWithProviders(<ActivityStatisticsPage />, { store: mockStore });

    expect(await screen.findByText(copy.duration)).toBeOnTheScreen();
    expect(screen.getByText(copy.distance)).toBeOnTheScreen();
  });
});
