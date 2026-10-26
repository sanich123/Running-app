import { act, render, waitFor } from '@testing-library/react-native';
import UserAvatar from './user-avatar';
import { getAvatarLabel } from './utils';

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

  it('renders the blurhash while a pending profile photo has no public URL', async () => {
    const result = await render(
      <UserAvatar size={40} placeholder="LKO2?U%2Tw=w]~RBVZRi};RPxuwH" testID="pending-avatar" />,
    );

    expect(result.getByTestId('pending-avatar')).toBeOnTheScreen();
  });

  it('renders a profile photo through CustomImage', async () => {
    const result = await render(
      <UserAvatar size={40} profilePhoto="https://example.com/avatar.jpg" testID="avatar-image" />,
    );

    expect(result.getByTestId('avatar-image').props.source).toEqual({ uri: 'https://example.com/avatar.jpg' });
  });

  it('shows the user initials when the profile photo cannot be loaded', async () => {
    const result = await render(
      <UserAvatar
        size={40}
        name="Eliud"
        surname="Kipchoge"
        profilePhoto="https://example.com/avatar.jpg"
        testID="avatar-image"
      />,
    );

    expect(result.getByTestId('avatar-image').props.onError).toBeDefined();
    await act(async () => result.getByTestId('avatar-image').props.onError());

    await waitFor(() => expect(result.getByText('EK')).toBeOnTheScreen());
  });

  it('clips custom profile photos to the avatar shape', async () => {
    const result = await render(
      <UserAvatar
        size={40}
        profilePhoto="https://example.com/avatar.jpg"
        placeholder="blurhash"
        testID="custom-avatar-image"
      />,
    );
    expect(result.getByTestId('custom-avatar-image').props.style).toEqual([
      { overflow: 'hidden' },
      { width: 40, height: 40, borderRadius: 20 },
    ]);
  });
});
