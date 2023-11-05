import { screen, userEvent } from '@testing-library/react-native';

import DeleteFriendBtn from './delete-friend-btn';
import * as auth from '../../auth/context/auth-context';
import { USER_AUTH_MOCKS } from '../../tests/mocks/use-auth';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
describe('Delete friend btn', () => {
  it('should correctly renders', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someUserId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<DeleteFriendBtn friendId="someFriendId" />, { store: mockStore });
    expect(screen.getByText('Unfollow')).toBeOnTheScreen();
  });
  it('should correctly unfollow the friend', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<DeleteFriendBtn friendId="0326e84a-946b-42da-b662-658c4c9a50d9" />, { store: mockStore });
    const unfollowBtn = screen.getByText('Unfollow');
    await userEvent.press(unfollowBtn);
    expect(await screen.findByText('Unfollow')).toBeOnTheScreen();
  });
});
