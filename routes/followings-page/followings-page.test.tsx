import { act, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ERROR_COMPONENT_TEST_ID } from '@Routes/error-component/const';
import { MOCK_SERVER_FOLLOWINGS, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ListOfFollowing from './followings-page';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.userId }),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('ListOfFollowing', () => {
  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/friend/${MOCK_SERVER_IDS.userId}`, loadingResponse));
    await renderWithProviders(<ListOfFollowing />);
    expect(screen.getByTestId('followings-loading')).toBeOnTheScreen();
  });

  it('renders followings returned by the server', async () => {
    await renderWithProviders(<ListOfFollowing />);
    expect(
      await screen.findByText(
        new RegExp(`${MOCK_SERVER_FOLLOWINGS[0].profile.name}.*${MOCK_SERVER_FOLLOWINGS[0].profile.surname}`),
      ),
    ).toBeOnTheScreen();
  });

  it('refreshes followings after pull-to-refresh', async () => {
    let requests = 0;
    server.use(
      http.get(`${BASE_URL}/friend/${MOCK_SERVER_IDS.userId}`, () => {
        requests += 1;
        return HttpResponse.json(MOCK_SERVER_FOLLOWINGS);
      }),
    );
    await renderWithProviders(<ListOfFollowing />);
    const list = await screen.findByTestId('followings-list');
    await act(async () => list.props.onRefresh());
    await act(async () => Promise.resolve());
    expect(requests).toBeGreaterThanOrEqual(2);
  });

  it('keeps the list content scrollable when it exceeds the viewport', async () => {
    await renderWithProviders(<ListOfFollowing />);
    const list = await screen.findByTestId('followings-list');

    expect(list.props.contentContainerStyle).toEqual({ flexGrow: 1 });
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/friend/${MOCK_SERVER_IDS.userId}`, errorResponse));
    await renderWithProviders(<ListOfFollowing />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
