import { useRouter } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetFriendsByUserIdQuery } from '../../redux/runich-api/runich-api';
import AddFriendBtn from '../add-friend-btn/add-friend-btn';
import AvatarShowable from '../avatar-showable/avatar-showable';
import DeleteFriendBtn from '../delete-friend-btn/delete-friend-btn';
import ErrorComponent from '../error-component/error-component';
import UserCityAge from '../user-city-age/user-city-age';
import UserNameSurname from '../user-name-surname/user-name-surname';

export default function UserListItem({ userId }: { userId: string }) {
  const { user } = useAuth();
  const { isLoading, error, data: friends } = useGetFriendsByUserIdQuery(user?.id);
  const isFriendOfOwner = friends?.filter(({ friendId }) => friendId === userId);
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
