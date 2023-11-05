import { screen } from '@testing-library/react-native';

import FollowersCount from './followers-count';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: 'someFriendId',
  }),
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
    expect(await screen.findByText('3')).toBeOnTheScreen();
  });
});
