import { render } from '@testing-library/react-native';
import UserAvatar, { getAvatarLabel } from './avatar';

describe('user avatar', () => {
  it('creates initials from the user name', () => {
    expect(getAvatarLabel('Искандер', 'Ядгаров')).toBe('ИЯ');
    expect(getAvatarLabel(null, null)).toBe('');
  });

  it('renders initials when the profile has no photo', async () => {
    const result = await render(<UserAvatar size={40} name="Eliud" surname="Kipchoge" testID="avatar-text" />);

    expect(result.getByTestId('avatar-text')).toBeOnTheScreen();
    expect(result.getByText('EK')).toBeOnTheScreen();
    expect(result.getByText('EK')).toHaveStyle({ includeFontPadding: false, textAlignVertical: 'center' });
  });

  it('renders the account icon when neither a photo nor a name exists', async () => {
    const result = await render(<UserAvatar size={40} testID="avatar-icon" />);

    expect(result.getByTestId('avatar-icon')).toBeOnTheScreen();
    expect(result.queryByText('?')).toBeNull();
  });

  it('renders Avatar.Image for a profile photo', async () => {
    const result = await render(
      <UserAvatar size={40} profilePhoto="https://example.com/avatar.jpg" testID="avatar-image" />,
    );

    expect(result.getByTestId('avatar-image').props.source).toEqual({ uri: 'https://example.com/avatar.jpg' });
  });
});
