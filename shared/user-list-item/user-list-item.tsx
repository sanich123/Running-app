import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import UserAvatar from '@S/avatar/avatar';
import FollowUnfollowBtn from '@S/user-list-item/follow-unfollow-btn/follow-unfollow-btn';
import type { UserListItemType } from './const';

export default memo(function UserListItem({
  name,
  surname,
  profilePhoto,
  placeholder,
  city,
  userId,
  commentsModalRef,
}: UserListItemType) {
  const { dark } = useTheme();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { push } = useRouter();
  const isMineActivity = userId === currentUserId;

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() => {
        commentsModalRef?.current?.dismiss();
        push(`/${ROUTES.profile}/${userId}`);
      }}>
      <View style={styles.userItemWrapper}>
        <View style={styles.contentWrapper}>
          <UserAvatar size={35} profilePhoto={profilePhoto} name={name} surname={surname} placeholder={placeholder} />
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
        {!isMineActivity && <FollowUnfollowBtn friendId={userId} />}
      </View>
    </TouchableRipple>
  );
});

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
