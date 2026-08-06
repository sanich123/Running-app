import { act, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { setUserId } from '@R/slices/auth/auth';
import { ERROR_COMPONENT_TEST_ID } from '@Routes/error-component/const';
import { MOCK_SERVER_FOLLOWERS, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ListOfFollowers from './followers-page';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.userId }),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('ListOfFollowers', () => {
  beforeEach(() => mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId)));

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/friend/${MOCK_SERVER_IDS.userId}/followers`, loadingResponse));
    await renderWithProviders(<ListOfFollowers />);
    expect(screen.getByTestId('followers-loading')).toBeOnTheScreen();
  });

  it('renders followers returned by the server', async () => {
    await renderWithProviders(<ListOfFollowers />);
    expect(
      await screen.findByText(
        new RegExp(`${MOCK_SERVER_FOLLOWERS[0].users.profile.name}.*${MOCK_SERVER_FOLLOWERS[0].users.profile.surname}`),
      ),
    ).toBeOnTheScreen();
  });

  it('refreshes followers after pull-to-refresh', async () => {
    let requests = 0;
    server.use(
      http.get(`${BASE_URL}/friend/${MOCK_SERVER_IDS.userId}/followers`, () => {
        requests += 1;
        return HttpResponse.json(MOCK_SERVER_FOLLOWERS);
      }),
    );
    await renderWithProviders(<ListOfFollowers />);
    const list = await screen.findByTestId('followers-list');
    await act(async () => list.props.onRefresh());
    await act(async () => Promise.resolve());
    expect(requests).toBeGreaterThanOrEqual(2);
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/friend/${MOCK_SERVER_IDS.userId}/followers`, errorResponse));
    await renderWithProviders(<ListOfFollowers />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
