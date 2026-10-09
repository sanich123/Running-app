import { screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { setAuthTokens } from '@R/slices/auth/auth';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import Feed from './home-page';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));
jest.mock('@S/infinite-scroll-list/infinite-scroll-list', () => {
  const { Text } = jest.requireActual('react-native');
  return ({ dataToRender }: any) => <Text>{dataToRender[0].title}</Text>;
});

describe('Feed', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockStore.dispatch(setAuthTokens({ accessToken: 'feed-access-token' }));
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    server.use(http.get(`${BASE_URL}/auth/config`, () => HttpResponse.json({ appVersion: '0.0.0' })));
  });

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/all`, loadingResponse));
    await renderWithProviders(<Feed />);
    expect(screen.getByTestId('homeActivityIndicator')).toBeOnTheScreen();
  });

  it('renders server activities', async () => {
    await renderWithProviders(<Feed />);
    expect(await screen.findByText(MOCK_SERVER_ACTIVITY.title)).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/all`, errorResponse));
    await renderWithProviders(<Feed />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });

  it('checks the app version on the home page and redirects when an update is required', async () => {
    let authorizationHeader: string | null = null;
    server.use(
      http.get(`${BASE_URL}/auth/config`, ({ request }) => {
        authorizationHeader = request.headers.get('authorization');
        return HttpResponse.json({ appVersion: '999.0.0' });
      }),
    );

    await renderWithProviders(<Feed />);

    expect(await screen.findByText(MOCK_SERVER_ACTIVITY.title)).toBeOnTheScreen();
    expect(authorizationHeader).toBe('Bearer feed-access-token');
    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.updateApp}`);
  });
});
