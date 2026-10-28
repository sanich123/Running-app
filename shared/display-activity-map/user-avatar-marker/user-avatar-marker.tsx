import { MarkerView } from '@rnmapbox/maps';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import UserAvatar from '@S/avatar/user-avatar/user-avatar';
import useSmoothedCoordinate from './use-smoothed-coordinate';
import type { UserAvatarMarkerProps } from './types';

export default function UserAvatarMarker({
  coordinate,
  userId,
  positionTimestamp,
  animateCoordinate = false,
  testID = 'user-avatar-marker-avatar',
  markerTestID,
}: UserAvatarMarkerProps) {
  const { colors } = useTheme();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const profileUserId = userId ?? currentUserId;
  const { data: profile } = useGetUserProfileByUserIdQuery(profileUserId ?? '', { skip: !profileUserId });
  const smoothedCoordinate = useSmoothedCoordinate(coordinate, positionTimestamp, animateCoordinate);

  return (
    <MarkerView
      coordinate={animateCoordinate ? smoothedCoordinate : coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      allowOverlap
      allowOverlapWithPuck>
      <View
        style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.primary }]}
        testID={markerTestID}>
        <UserAvatar
          size={36}
          profilePhoto={profile?.profilePhoto}
          name={profile?.name}
          surname={profile?.surname}
          placeholder={profile?.profilePhotoBlurhash}
          testID={testID}
        />
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    elevation: 5,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 44,
  },
});
