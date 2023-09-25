import { useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetFriendsByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import AddFriendBtn from '../add-friend-btn/add-friend-btn';
import AvatarShowable from '../avatar/avatar-showable';
import DeleteFriendBtn from '../delete-friend-btn/delete-friend-btn';
import ErrorComponent from '../error-component/error-component';
import UserCityAge from '../user-city-age/user-city-age';
import UserNameSurname from '../user-name-surname/user-name-surname';

export default function UserListItem({ userId }: { userId: string }) {
  const { user } = useAuth();
  const { isLoading, error, data: friends } = useGetFriendsByUserIdQuery(user.id);
  const isFriendOfOwner = friends?.filter(({ friendId }) => friendId === userId);
  const isMineActivity = userId === user.id;
  const router = useRouter();
  return (
    <View style={styles.userItemWrapper}>
      <Pressable onPress={() => router.push(`/home/profile/${userId}`)}>
        <AvatarShowable size={35} id={userId} />
      </Pressable>

      <View style={{ display: 'flex' }}>
        <UserNameSurname size="bodyLarge" />
        <UserCityAge userId={userId} size="bodyMedium" />
      </View>

      {isLoading && <ActivityIndicator size="small" />}
      {error ? <ErrorComponent error={error} /> : null}
      {!isMineActivity ? (
        isFriendOfOwner?.length ? (
          <DeleteFriendBtn friendId={userId} />
        ) : (
          <AddFriendBtn friendId={userId} />
        )
      ) : null}
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
