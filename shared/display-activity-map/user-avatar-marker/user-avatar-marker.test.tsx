import { screen, waitFor } from '@testing-library/react-native';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { renderWithProviders } from '@T/utils/test-utils';
import { interpolateCoordinate } from './use-smoothed-coordinate';
import UserAvatarMarker from './user-avatar-marker';

describe('UserAvatarMarker', () => {
  it('loads the profile photo inside the map marker', async () => {
    await renderWithProviders(
      <UserAvatarMarker coordinate={[37.6, 55.7]} userId={MOCK_SERVER_IDS.userId} markerTestID="profile-marker" />,
    );

    expect(screen.getByTestId('profile-marker')).toBeOnTheScreen();
    expect(screen.getByTestId('user-avatar-marker-avatar')).toBeOnTheScreen();
    await waitFor(() =>
      expect(screen.getByTestId('user-avatar-marker-avatar').props.source).toEqual({
        uri: MOCK_SERVER_PROFILE.profilePhoto,
      }),
    );
  });

  it('eases marker movement between coordinates', () => {
    expect(interpolateCoordinate([1, 2], [3, 4], 0.5)).toEqual([2.75, 3.75]);
    expect(interpolateCoordinate([1, 2], [3, 4], 1)).toEqual([3, 4]);
  });
});
