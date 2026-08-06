import { act, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@Routes/error-component/const';
import { MOCK_SERVER_IDS, MOCK_SERVER_LIKES } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import LikesList from './likes-list';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.activityId }),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('LikesList', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/like/${MOCK_SERVER_IDS.activityId}`, loadingResponse));
    await renderWithProviders(<LikesList />);
    expect(screen.getByTestId('likes-list-loading')).toBeOnTheScreen();
  });

  it('renders likes returned by the server', async () => {
    await renderWithProviders(<LikesList />);
    expect(
      await screen.findByText(
        new RegExp(`${MOCK_SERVER_LIKES[0].profile.name}.*${MOCK_SERVER_LIKES[0].profile.surname}`),
      ),
    ).toBeOnTheScreen();
  });

  it('refreshes likes after pull-to-refresh', async () => {
    let requests = 0;
    server.use(
      http.get(`${BASE_URL}/like/${MOCK_SERVER_IDS.activityId}`, () => {
        requests += 1;
        return HttpResponse.json(MOCK_SERVER_LIKES);
      }),
    );
    await renderWithProviders(<LikesList />);
    const list = await screen.findByTestId('likes-list');
    await act(async () => list.props.onRefresh());
    await act(async () => Promise.resolve());
    expect(requests).toBeGreaterThanOrEqual(2);
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/like/${MOCK_SERVER_IDS.activityId}`, errorResponse));
    await renderWithProviders(<LikesList />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
