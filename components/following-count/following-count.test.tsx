import { screen } from '@testing-library/react-native';

import { FOLLOWING_COUNT } from './const';
import FollowingCount from './following-count';
import * as auth from '../../auth/context/auth-context';
import { MOCK_FRIENDS } from '../../tests/mocks/mock-friends';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

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
