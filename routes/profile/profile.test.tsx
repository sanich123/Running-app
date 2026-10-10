import { act, screen, userEvent } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ROUTES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfilePage from './profile';

const mockPathname = `/${ROUTES.profile}`;
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.userId }),
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
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
  return ({ variant, isHidden }: { variant: string; isHidden?: boolean }) => (
    <View testID={`profile-users-counter-${variant}`} accessibilityLabel={isHidden ? 'hidden' : 'visible'} />
  );
});

describe('ProfilePage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
  });

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
    expect(screen.getByTestId('profile-users-counter-whoUserFollows')).toBeOnTheScreen();
  });

  it('hides following and followers lists from other users when enabled', async () => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId('another-user-id'));
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_SERVER_PROFILE, hideFollowingList: true }),
      ),
    );

    await renderWithProviders(<ProfilePage />);
    await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`);

    expect(screen.queryByTestId('profile-community-section')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('profile-users-counter-whoUserFollows')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('profile-users-counter-whoFollowsUser')).not.toBeOnTheScreen();
  });

  it('hides total activity statistics from other users when enabled', async () => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId('another-user-id'));
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_SERVER_PROFILE, hideActivityStatistics: true }),
      ),
    );

    await renderWithProviders(<ProfilePage />);
    await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`);

    expect(screen.queryByTestId('profile-statistics')).not.toBeOnTheScreen();
  });

  it('hides the follow control when the profile disallows new followers', async () => {
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId('another-user-id'));
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_SERVER_PROFILE, allowNewFollowers: false }),
      ),
    );

    await renderWithProviders(<ProfilePage />);
    await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`);

    expect(screen.queryByTestId('profile-follow')).not.toBeOnTheScreen();
    await act(async () => {
      mockStore.dispatch(runichApi.util.resetApiState());
    });
  });

  it('opens privacy settings from the profile page', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ProfilePage />);
    expect(await screen.findByText('Конфиденциальность')).toBeOnTheScreen();
    expect(screen.queryByText(/Видимость профиля, подписки/)).not.toBeOnTheScreen();

    await user.press(screen.getByTestId('profile-privacy-settings-button'));

    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.profile}/${ROUTES.profilePrivacySettings}`);
  });

  it('opens the profile photo in a modal', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_SERVER_PROFILE, profilePhotoBlurhash: 'profile-modal-blurhash' }),
      ),
    );
    await renderWithProviders(<ProfilePage />);
    const avatarButton = await screen.findByTestId('profile-avatar-open-button');

    await user.press(avatarButton);

    expect(await screen.findByTestId('profile-photo-modal-image')).toHaveProp(
      'placeholder',
      'blurhash:/profile-modal-blurhash',
    );
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

  it('hides the media preview from other users when profile photos are private', async () => {
    const viewedUserId = MOCK_SERVER_IDS.userId;
    let mediaRequests = 0;
    mockStore.dispatch(setMockUserId('another-user-id'));
    server.use(
      http.get(`${BASE_URL}/user/${viewedUserId}/profile`, () =>
        HttpResponse.json({ ...MOCK_SERVER_PROFILE, hideProfilePhotos: true }),
      ),
      http.get(`${BASE_URL}/activity/${viewedUserId}/media`, () => {
        mediaRequests += 1;
        return HttpResponse.json({ media: [], hasMore: false, nextCursor: null });
      }),
    );

    await renderWithProviders(<ProfilePage />);
    await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`);

    expect(mediaRequests).toBe(0);
    expect(screen.queryByTestId('profile-privacy-settings-button')).not.toBeOnTheScreen();
  });

  it('shows the privacy settings link to the profile owner', async () => {
    let mediaRequests = 0;
    server.use(
      http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, () =>
        HttpResponse.json({ ...MOCK_SERVER_PROFILE, hideProfilePhotos: true }),
      ),
      http.get(`${BASE_URL}/activity/${MOCK_SERVER_IDS.userId}/media`, () => {
        mediaRequests += 1;
        return HttpResponse.json({ media: [], hasMore: false, nextCursor: null });
      }),
    );

    await renderWithProviders(<ProfilePage />);

    expect(await screen.findByTestId('profile-privacy-settings-button')).toBeOnTheScreen();
    expect(mediaRequests).toBe(1);
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, errorResponse));
    await renderWithProviders(<ProfilePage />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
