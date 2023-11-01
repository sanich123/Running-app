import { screen, userEvent } from '@testing-library/react-native';

import AddFriendBtn from './add-friend-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'someUserId',
    },
  }),
}));

describe('Add friend btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<AddFriendBtn friendId="someFriendId" />);
    expect(screen.getByText(/follow/i)).toBeOnTheScreen();
  });
  it('should correctly handle http requests', async () => {
    renderWithProviders(<AddFriendBtn friendId="someFriendId" />, { store: mockStore });
    const followBtn = screen.getByText(/follow/i);
    await userEvent.press(followBtn);
    expect(await screen.findByText(/follow/i)).toBeOnTheScreen();
  });
});
