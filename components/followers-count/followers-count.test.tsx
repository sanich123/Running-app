import * as auth from '@A/context/auth-context';
import { MOCK_FOLLOWERS } from '@T/mocks/mock-followers';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import FollowersCount from './followers-count';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '7857abb1-b125-4f39-becf-8f30216b46ec' }),
  usePathname: () => 'somePathname',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Followers count', () => {
  it('should correctly renders', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<FollowersCount />, { store: mockStore });
    expect(await screen.findByText('Followers')).toBeOnTheScreen();
    expect(await screen.findByText(`${MOCK_FOLLOWERS.length}`)).toBeOnTheScreen();
  });
});
