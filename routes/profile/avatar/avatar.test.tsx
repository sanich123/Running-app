import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ProfileAvatar from './avatar';

describe('avatar', () => {
  it('shows the default avatar when no profile photo exists', async () => {
    await renderWithProviders(<ProfileAvatar />);
    expect(screen.getByTestId('avatarEditableDefaultIcon')).toBeOnTheScreen();
  });

  it('shows the saved profile photo when one exists', async () => {
    await renderWithProviders(
      <ProfileAvatar profilePhoto="https://example.com/profile.jpg" profilePhotoBlurhash="profile-blurhash" />,
    );
    expect(screen.getByTestId('avatarEditableImage').props.source).toEqual({
      uri: 'https://example.com/profile.jpg',
    });
    expect(screen.getByTestId('avatarEditableImage').props.placeholder).toBe('blurhash:/profile-blurhash');
    expect(screen.queryByTestId('avatarEditableDefaultIcon')).not.toBeOnTheScreen();
  });
});
