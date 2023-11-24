import { screen } from '@testing-library/react-native';

import * as auth from '../../auth/context/auth-context';
import { FOLLOWING_COUNT } from '../../components/following-count/const';
import FollowingCount from '../../components/following-count/following-count';
import { MOCK_FRIENDS } from '../mocks/mock-friends';
import { USER_AUTH_MOCKS } from '../mocks/use-auth';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b' }),
  usePathname: () => 'somePathname',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Following count', () => {
  it('should correctly renders data in english', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<FollowingCount />, { store: mockStore });
    expect(await screen.findByText(FOLLOWING_COUNT.english.followings)).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FRIENDS.length}`)).toBeOnTheScreen();
  });
});
