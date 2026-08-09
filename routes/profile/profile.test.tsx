import { screen } from '@testing-library/react-native';
import { http } from 'msw';
import { ROUTES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { errorResponse, loadingResponse } from '@T/utils/response-states';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfilePage from './profile';

const mockPathname = `/${ROUTES.profile}`;
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: MOCK_SERVER_IDS.userId }),
  usePathname: () => mockPathname,
}));
jest.mock('@S/avatar/showable/showable', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="profile-avatar" />;
});
jest.mock('@Routes/profile/media-photos/media-photos', () => {
  const { View } = jest.requireActual('react-native');
  return () => <View testID="profile-media" />;
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
  beforeEach(() => mockStore.dispatch(setUserId(MOCK_SERVER_IDS.userId)));

  it('renders loading state', async () => {
    server.use(http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, loadingResponse));
    await renderWithProviders(<ProfilePage />);
    expect(screen.getByTestId('profile-page-loading')).toBeOnTheScreen();
  });

  it('renders the profile returned by the server', async () => {
    await renderWithProviders(<ProfilePage />);
    expect(await screen.findByText(`${MOCK_SERVER_PROFILE.name} ${MOCK_SERVER_PROFILE.surname}`)).toBeOnTheScreen();
    expect(screen.getByTestId('profile-statistics')).toBeOnTheScreen();
  });

  it('renders error state', async () => {
    server.use(http.get(`${BASE_URL}/user/${MOCK_SERVER_IDS.userId}/profile`, errorResponse));
    await renderWithProviders(<ProfilePage />);
    expect(await screen.findByTestId(ERROR_COMPONENT_TEST_ID)).toBeOnTheScreen();
  });
});
