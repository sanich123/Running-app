import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import { UserProfileAvatarIcons, UserProfileAvatarTestIds } from './const';
import UserAvatar from '../user-avatar/user-avatar';
import type { UserProfileAvatarProps } from './types';

export default function UserProfileAvatar({
  size,
  id,
  focused,
  profile: profileFromProps,
  testID,
  cachePolicy,
  recyclingKey,
  transition,
}: UserProfileAvatarProps) {
  const { colors } = useTheme();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const {
    data: profileFromServer,
    isLoading: isProfileQueryLoading,
    isSuccess: isProfileQuerySuccess,
    isError: isProfileQueryError,
  } = useGetUserProfileByUserIdQuery(id, { skip: !id || Boolean(profileFromProps) });
  const profile = profileFromProps ?? profileFromServer;
  const isLoading = !profileFromProps && isProfileQueryLoading;
  const isSuccess = Boolean(profileFromProps) || isProfileQuerySuccess;
  const isError = !profileFromProps && isProfileQueryError;
  const isOwnProfile = Boolean(currentUserId && (id === currentUserId || profile?.userId === currentUserId));
  const isPendingReview =
    !isOwnProfile && ['queued', 'processing', 'review_required'].includes(profile?.profilePhotoReviewStatus ?? '');

  return isLoading ? (
    <ActivityIndicator
      testID={UserProfileAvatarTestIds.isLoading}
      size={Math.round(size * 0.6)}
      color={focused ? colors.primary : colors.onSurfaceDisabled}
    />
  ) : isError ? (
    <Avatar.Icon testID={UserProfileAvatarTestIds.error} size={size} icon={UserProfileAvatarIcons.error} />
  ) : isSuccess ? (
    <View style={[styles.avatar, { width: size, height: size }]}>
      <UserAvatar
        size={size}
        profilePhoto={profile?.profilePhoto}
        name={profile?.name}
        surname={profile?.surname}
        placeholder={profile?.profilePhotoBlurhash}
        testID={testID ?? (profile?.profilePhoto ? UserProfileAvatarTestIds.success : UserProfileAvatarTestIds.default)}
        cachePolicy={cachePolicy}
        recyclingKey={recyclingKey}
        transition={transition}
        style={{ borderWidth: 1, borderColor: focused ? colors.primary : 'transparent' }}
      />
      {isPendingReview ? (
        <MediaModerationPlaceholder
          status={profile?.profilePhotoReviewStatus}
          overlay
          overlayIconSize={Math.min(20, Math.round(size * 0.4))}
          topOffset={0}
          testID={UserProfileAvatarTestIds.moderationStatus}
        />
      ) : null}
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  avatar: { position: 'relative' },
});
