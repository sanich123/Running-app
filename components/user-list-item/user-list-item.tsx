import { useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';

import { useAuth } from '../../auth/context/auth-context';
import AddDeleteFriendBtn from '../add-delete-friend-btn/add-delete-friend-btn';
import AvatarShowable from '../avatar-showable/avatar-showable';
import UserCityAge from '../user-city-age/user-city-age';
import UserNameSurname from '../user-name-surname/user-name-surname';

export default function UserListItem({ userId }: { userId: string }) {
  const { user } = useAuth();
  const isMineActivity = userId === user?.id;
  const { push } = useRouter();

  return (
    <View style={styles.userItemWrapper}>
      <Pressable
        style={{ display: 'flex', flexDirection: 'row', columnGap: 10 }}
        onPress={() => push(`/home/profile/${userId}`)}>
        <AvatarShowable size={35} id={userId} />
        <View>
          <UserNameSurname userId={userId} size="bodyLarge" />
          <UserCityAge userId={userId} size="bodyMedium" />
        </View>
      </Pressable>
      {!isMineActivity && <AddDeleteFriendBtn friendId={userId} />}
    </View>
  );
}

const styles = StyleSheet.create({
  userItemWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
});
