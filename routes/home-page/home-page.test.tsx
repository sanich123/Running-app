import type { ReactNode } from 'react';
import { screen, userEvent } from '@testing-library/react-native';
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
import HomePage from './home-page';
import type { ActivityListItemResponse } from '@R/runich-api/types';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }));
jest.mock('@S/infinite-scroll-list/infinite-scroll-list', () => {
  const { Text, View } = jest.requireActual('react-native');
  return ({
    dataToRender,
    headerAfterWeekStatistics,
  }: {
    dataToRender: ActivityListItemResponse[];
    headerAfterWeekStatistics?: ReactNode;
  }) => (
    <View>
      {headerAfterWeekStatistics}
      <Text>{dataToRender[0].title}</Text>
    </View>
  );
});

describe('HomePage', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockStore.dispatch(setAuthTokens({ accessToken: 'feed-access-token' }));
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    server.use(
      http.get(`${BASE_URL}/auth/config`, () => HttpResponse.json({ appVersion: '0.0.0' })),
      http.get(`${BASE_URL}/activity/home`, () => {
        const page = { activities: [MOCK_SERVER_ACTIVITY], hasMore: false, nextCursor: null };
        return HttpResponse.json({ my: page, followers: page, favorites: { ...page, activities: [] } });
      }),
    );
  });

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/activity/home`, loadingResponse));
    await renderWithProviders(<HomePage />);
    expect(screen.getByText('Ваш недельный отчет')).toBeOnTheScreen();
    expect(screen.getByTestId('home-feed-switcher')).toBeOnTheScreen();
    expect(screen.getByTestId('home-feed-skeleton')).toBeOnTheScreen();
    expect(screen.getByTestId('cross-platform-scroll-view')).toBeOnTheScreen();
  });

  it('renders server activities', async () => {
    await renderWithProviders(<HomePage />);
    expect(await screen.findByText(MOCK_SERVER_ACTIVITY.title)).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/activity/home`, errorResponse));
    await renderWithProviders(<HomePage />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });

  it('switches between own, following, and favorite activity feeds', async () => {
    const homeFeedRequestUrls: string[] = [];
    const page = (title: string) => ({
      activities: [{ ...MOCK_SERVER_ACTIVITY, title }],
      hasMore: false,
      nextCursor: null,
    });
    server.use(
      http.get(`${BASE_URL}/activity/home`, ({ request }) => {
        homeFeedRequestUrls.push(request.url);
        return HttpResponse.json({
          my: page('My activity'),
          followers: page('Following activity'),
          favorites: page('Favorite activity'),
        });
      }),
    );
    const user = userEvent.setup();
    await renderWithProviders(<HomePage />);

    expect(await screen.findByText('Following activity')).toBeOnTheScreen();
    await user.press(screen.getByRole('tab', { name: 'Мои' }));
    expect(await screen.findByText('My activity')).toBeOnTheScreen();
    await user.press(screen.getByRole('tab', { name: 'Избранное' }));
    expect(await screen.findByText('Favorite activity')).toBeOnTheScreen();

    expect(homeFeedRequestUrls).toHaveLength(1);
    expect(new URL(homeFeedRequestUrls[0]!).searchParams.get('take')).toBe('20');
  });

  it('checks the app version on the home page and redirects when an update is required', async () => {
    let authorizationHeader: string | null = null;
    server.use(
      http.get(`${BASE_URL}/auth/config`, ({ request }) => {
        authorizationHeader = request.headers.get('authorization');
        return HttpResponse.json({ appVersion: '999.0.0' });
      }),
    );

    await renderWithProviders(<HomePage />);

    expect(await screen.findByText(MOCK_SERVER_ACTIVITY.title)).toBeOnTheScreen();
    expect(authorizationHeader).toBe('Bearer feed-access-token');
    expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.updateApp}`);
  });
});
