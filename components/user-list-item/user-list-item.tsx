import { useAuth } from '@A/context/auth-context';
import AddDeleteFriendBtn from '@C/add-delete-friend-btn/add-delete-friend-btn';
import AvatarShowable from '@C/avatar-showable/avatar-showable';
import UserCityAge from '@C/user-city-age/user-city-age';
import UserNameSurname from '@C/user-name-surname/user-name-surname';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';

export default function UserListItem({ userId }: { userId: string }) {
  const { user } = useAuth();
  const isMineActivity = userId === user?.id;
  const { push } = useRouter();

  return (
    <View style={styles.userItemWrapper}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.pressableAreaWrapper]}
        onPress={() => push(`/${ROUTES.home}/${ROUTES.profile}/${userId}`)}>
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
  pressableAreaWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
});
