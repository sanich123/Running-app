import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import UserProfileAvatar from '@S/avatar/user-profile-avatar/user-profile-avatar';
import FollowUnfollowBtn from '@S/user-list-item/follow-unfollow-btn/follow-unfollow-btn';
import type { UserListItemType } from './const';

export default function UserListItem({
  name,
  surname,
  profilePhoto,
  profilePhotoReviewStatus,
  placeholder,
  city,
  userId,
  allowNewFollowers,
  commentsModalRef,
}: UserListItemType) {
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { push } = useRouter();
  const isMineActivity = userId === currentUserId;

  return (
    <TouchableRipple
      borderless
      onPress={() => {
        commentsModalRef?.current?.dismiss();
        push(`/${ROUTES.profile}/${userId}`);
      }}>
      <View style={styles.userItemWrapper}>
        <View style={styles.contentWrapper}>
          <UserProfileAvatar
            size={35}
            id={userId}
            profile={{ name, surname, profilePhoto, profilePhotoBlurhash: placeholder, profilePhotoReviewStatus }}
            testID={`user-list-item-avatar-${userId}`}
            cachePolicy="memory-disk"
            recyclingKey={userId}
            transition={0}
          />
          <View style={styles.userInfo}>
            <View style={styles.nameSurnameWrapper}>
              <Text variant="bodyLarge" numberOfLines={1} ellipsizeMode="tail" style={{ fontWeight: 'bold' }}>
                {name} {surname}
              </Text>
            </View>
            {city ? (
              <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail">
                {city}
              </Text>
            ) : null}
          </View>
        </View>
        {!isMineActivity && allowNewFollowers !== false && <FollowUnfollowBtn compact friendId={userId} />}
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  userItemWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    minWidth: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  nameSurnameWrapper: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
  },
});
