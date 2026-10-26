import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import MediaModerationPlaceholder from '@S/media-moderation-placeholder/media-moderation-placeholder';
import UserAvatar from '../../user-avatar/user-avatar';
import { AvatarShowableIcons, AvatarShowableTestIds } from '../const';
import type { ProfileType } from '@S/card/types';
import type { ImageProps } from 'expo-image';

export default function AvatarShowable({
  size,
  id,
  focused,
  profile: profileFromProps,
  testID,
  cachePolicy,
  recyclingKey,
  transition,
}: {
  size: number;
  id: string;
  focused?: boolean;
  profile?: ProfileType;
  testID?: string;
  cachePolicy?: ImageProps['cachePolicy'];
  recyclingKey?: string | null;
  transition?: ImageProps['transition'];
}) {
  const { colors } = useTheme();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
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
  const isOwnProfile = Boolean(currentUserId && (id === currentUserId || profile?.userId === currentUserId));
  const isPendingReview =
    !isOwnProfile &&
    (profile?.profilePhotoReviewStatus === 'queued' ||
      profile?.profilePhotoReviewStatus === 'processing' ||
      profile?.profilePhotoReviewStatus === 'review_required');

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
        <View style={[styles.avatar, { width: size, height: size }]}>
          <UserAvatar
            size={size}
            profilePhoto={profile?.profilePhoto}
            name={profile?.name}
            surname={profile?.surname}
            placeholder={profile?.profilePhotoBlurhash}
            testID={testID ?? (profile?.profilePhoto ? AvatarShowableTestIds.success : AvatarShowableTestIds.default)}
            cachePolicy={cachePolicy}
            recyclingKey={recyclingKey}
            transition={transition}
            style={{ borderWidth: 1, borderColor: focused ? colors.primary : 'transparent' }}
          />
          {isPendingReview ? (
            <MediaModerationPlaceholder
              status={profile?.profilePhotoReviewStatus}
              overlay
              topOffset={0}
              testID={AvatarShowableTestIds.moderationStatus}
            />
          ) : null}
        </View>
      ) : null}

      {isError && <Avatar.Icon testID={AvatarShowableTestIds.error} size={size} icon={AvatarShowableIcons.error} />}
    </>
  );
}

const styles = StyleSheet.create({
  avatar: { position: 'relative' },
});
