import { screen, userEvent } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfilePage from './profile';

const mockPathname = `/${ROUTES.profile}`;
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.userId }),
  usePathname: () => mockPathname,
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@S/avatar/showable/showable', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="profile-avatar" />;
});
jest.mock('@S/user-list-item/follow-unfollow-btn/follow-unfollow-btn', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="profile-follow" />;
});
jest.mock('./statistics/profile-statistics', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="profile-statistics" />;
});
jest.mock('./users-counter/users-counter', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="profile-users-counter" />;
});

describe('ProfilePage', () => {
  beforeEach(() => mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId)));

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, loadingResponse));
    await renderWithProviders(<ProfilePage />);
    expect(screen.getByTestId('profile-page-skeleton')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-skeleton-avatar')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-skeleton-name')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-skeleton-followers')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-skeleton-statistics')).toBeOnTheScreen();
  });

  it('renders the profile returned by the server', async () => {
    await renderWithProviders(<ProfilePage />);
    expect(await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`)).toBeOnTheScreen();
    expect(screen.getByTestId('profile-statistics')).toBeOnTheScreen();
  });

  it('opens the profile photo in a modal', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ProfilePage />);
    const avatarButton = await screen.findByTestId('profile-avatar-open-button');

    await user.press(avatarButton);

    expect(await screen.findByTestId('profile-photo-modal-image')).toBeOnTheScreen();
    await user.press(screen.getByTestId('profile-photo-modal-close'));
    expect(screen.queryByTestId('profile-photo-modal-image')).not.toBeOnTheScreen();
  });

  it('loads media previews for the viewed profile', async () => {
    const viewedUserId = MOCK_SERVER_IDS.userId;
    const loggedInUserId = 'another-user-id';
    let requestedUrl = '';
    mockStore.dispatch(setMockUserId(loggedInUserId));
    server.use(
      http.get(`${BASE_URL}/activity/${viewedUserId}/media`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ media: [], hasMore: false, nextCursor: null });
      }),
      http.get(`${BASE_URL}/activity/${loggedInUserId}/media`, () => {
        throw new Error('The logged-in user id must not be used for the viewed profile media request');
      }),
    );

    await renderWithProviders(<ProfilePage />);
    await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`);

    expect(requestedUrl).toContain(`/activity/${viewedUserId}/media?take=4`);
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, errorResponse));
    await renderWithProviders(<ProfilePage />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
