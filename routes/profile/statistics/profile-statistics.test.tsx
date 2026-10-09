import { screen, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_SERVER_IDS, MOCK_SERVER_STATISTICS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfileStatistics from './profile-statistics';

describe('ProfileStatistics', () => {
  beforeEach(() => mockStore.dispatch(changeLanguage(LANGUAGES.english)));
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/all`, loadingResponse));
    await renderWithProviders(<ProfileStatistics whosProfile={MOCK_SERVER_IDS.userId} />);
    expect(screen.getAllByTestId('month-statistics-skeleton')).toHaveLength(3);
    expect(screen.queryByText(`${MOCK_SERVER_STATISTICS.all.totalItems}`)).not.toBeOnTheScreen();
  });
  it('renders success state', async () => {
    await renderWithProviders(<ProfileStatistics whosProfile={MOCK_SERVER_IDS.userId} />);
    expect(await screen.findByText(`${MOCK_SERVER_STATISTICS.all.totalItems}`)).toBeOnTheScreen();
    expect(screen.queryByText('Training summary')).not.toBeOnTheScreen();
  });
  it('does not render metrics when the user has no activities', async () => {
    server.use(
      http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/all`, () =>
        HttpResponse.json({ totalDuration: 0, totalDistance: 0, totalItems: 0 }),
      ),
    );

    await renderWithProviders(<ProfileStatistics whosProfile={MOCK_SERVER_IDS.userId} />);

    await waitFor(() => expect(screen.queryByTestId('month-statistics-skeleton')).not.toBeOnTheScreen());
    expect(screen.queryByText('Activities')).not.toBeOnTheScreen();
  });
  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/statistics/${MOCK_SERVER_IDS.userId}/all`, errorResponse));
    await renderWithProviders(<ProfileStatistics whosProfile={MOCK_SERVER_IDS.userId} />);
    expect(screen.queryByText(/error/i)).not.toBeOnTheScreen();
  });
});
