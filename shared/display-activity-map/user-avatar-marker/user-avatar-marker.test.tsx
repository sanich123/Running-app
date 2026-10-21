import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import UserAvatarMarker from './user-avatar-marker';

describe('UserAvatarMarker', () => {
  it('shows the user avatar inside the map marker', async () => {
    await renderWithProviders(
      <UserAvatarMarker coordinate={[37.6, 55.7]} name="Ирина" surname="Иванова" markerTestID="profile-marker" />,
    );

    expect(screen.getByTestId('profile-marker')).toBeOnTheScreen();
    expect(screen.getByTestId('user-avatar-marker-avatar')).toBeOnTheScreen();
  });
});
