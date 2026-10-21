import { ActivityIndicator, Avatar, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import UserAvatar from '../../user-avatar/user-avatar';
import { AvatarShowableIcons, AvatarShowableTestIds } from '../const';
import type { ProfileType } from '@S/card/types';

export default function AvatarShowable({
  size,
  id,
  focused,
  profile: profileFromProps,
}: {
  size: number;
  id: string;
  focused?: boolean;
  profile?: ProfileType;
}) {
  const { colors } = useTheme();
  const {
    data: profileFromServer,
    isLoading: isProfileLoading,
    isSuccess: isProfileLoaded,
    isError: isProfileError,
  } = useGetUserProfileByUserIdQuery(id, { skip: !id || Boolean(profileFromProps) });
  const profile = profileFromProps ?? profileFromServer;
  const isLoading = !profileFromProps && isProfileLoading;
  const isSuccess = Boolean(profileFromProps) || isProfileLoaded;
  const isError = !profileFromProps && isProfileError;

  return (
    <>
      {isLoading && (
        <ActivityIndicator
          testID={AvatarShowableTestIds.isLoading}
          size={Math.round(size * 0.6)}
          color={focused ? colors.primary : colors.onSurfaceDisabled}
        />
      )}
      {isSuccess ? (
        <UserAvatar
          size={size}
          profilePhoto={profile?.profilePhoto}
          name={profile?.name}
          surname={profile?.surname}
          placeholder={profile?.profilePhotoBlurhash}
          testID={profile?.profilePhoto ? AvatarShowableTestIds.success : AvatarShowableTestIds.default}
          style={{ borderWidth: 1, borderColor: focused ? colors.primary : 'transparent' }}
        />
      ) : null}

      {isError && <Avatar.Icon testID={AvatarShowableTestIds.error} size={size} icon={AvatarShowableIcons.error} />}
    </>
  );
}
