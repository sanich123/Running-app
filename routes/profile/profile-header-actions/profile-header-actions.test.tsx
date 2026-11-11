import { render, screen } from '@testing-library/react-native';
import ProfileHeaderActions from './profile-header-actions';

jest.mock('@S/moderation/user-safety-menu/user-safety-menu', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ userId }: { userId: string }) => <Text testID="user-safety-menu">{userId}</Text>,
  };
});

jest.mock('@S/users-settings-icons/users-settings-icons', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="users-settings-icons" /> };
});

describe('ProfileHeaderActions', () => {
  it('always shows settings actions and only shows safety actions for another user', async () => {
    await render(<ProfileHeaderActions currentUserId="current" profileUserId="other" />);

    expect(screen.getByTestId('users-settings-icons')).toBeOnTheScreen();
    expect(screen.getByTestId('user-safety-menu')).toHaveTextContent('other');
  });

  it('does not show the safety menu for the current or an unknown profile', async () => {
    const { rerender } = await render(<ProfileHeaderActions currentUserId="current" profileUserId="current" />);
    expect(screen.queryByTestId('user-safety-menu')).toBeNull();

    await rerender(<ProfileHeaderActions currentUserId="current" />);
    expect(screen.queryByTestId('user-safety-menu')).toBeNull();
  });
});
