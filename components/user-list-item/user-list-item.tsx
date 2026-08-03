import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { CustomImage } from '@C/custom-image/custom-image';
import FollowUnfollowBtn from '@C/profile/follow-unfollow-btn/follow-unfollow-btn';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import type { UserListItemType } from './const';

export default function UserListItem({ name, surname, profilePhoto, placeholder, city, user_id }: UserListItemType) {
  const { dark } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { push } = useRouter();
  const isMineActivity = user_id === userId;

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() => push(`/(protected)/${ROUTES.profile}/${user_id}`)}>
      <View style={styles.userItemWrapper}>
        <View style={styles.contentWrapper}>
          <CustomImage
            style={styles.avatarSize}
            source={{ uri: profilePhoto }}
            contentFit="cover"
            placeholder={placeholder}
          />
          <View>
            <View style={styles.nameSurnameWrapper}>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                {name} {surname}
              </Text>
            </View>
            {city ? <Text variant="bodyMedium">{city}</Text> : null}
          </View>
        </View>
        {!isMineActivity && <FollowUnfollowBtn friendId={user_id} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  avatarSize: {
    width: 35,
    height: 35,
    borderRadius: 70,
  },
  nameSurnameWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
});
