import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { View } from '../../../../components/Themed';
import AddFriendBtn from '../../../../components/add-friend-btn/add-friend-btn';
import AmountOfFriends from '../../../../components/amount-of-friends/amount-of-friends';
import AvatarShowable from '../../../../components/avatar/avatar-showable';
import DeleteFriendBtn from '../../../../components/delete-friend-btn/delete-friend-btn';
import ErrorComponent from '../../../../components/error-component/error-component';
import UserBio from '../../../../components/user-bio/user-bio';
import UserCityAge from '../../../../components/user-city-age/user-city-age';
import UserNameSurname from '../../../../components/user-name-surname/user-name-surname';
import { useGetFriendsByUserIdQuery } from '../../../../redux/runnich-api/runnich-api';

export default function Profile() {
  const { id: friendId } = useLocalSearchParams();
  const { id } = useSelector(({ userInfo }) => userInfo);
  const whoIsViewing = friendId && friendId !== id ? friendId : id;
  const { isLoading, error, data: listOfFriends } = useGetFriendsByUserIdQuery(id);
  const friendCell = listOfFriends?.filter(({ friendId: friendIdOnServer }) => friendIdOnServer === friendId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AvatarShowable size={100} id={whoIsViewing} />
        <View style={styles.nicknameWrapper}>
          <UserNameSurname userId={whoIsViewing} size="headlineSmall" />
          <UserCityAge userId={whoIsViewing} size="titleLarge" />
        </View>
      </View>
      <View style={styles.bio}>
        <UserBio userId={whoIsViewing} size="titleSmall" />
      </View>
      {isLoading && <ActivityIndicator size="small" />}
      {listOfFriends?.length ? <AmountOfFriends id={friendId.toString()} /> : null}
      {!friendCell?.length ? (
        <AddFriendBtn friendId={friendId.toString()} />
      ) : (
        <DeleteFriendBtn idOfFriendsCell={friendCell[0].id} />
      )}
      {error ? <ErrorComponent error={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 10,
  },
  nicknameWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  bio: {
    display: 'flex',
    marginTop: 20,
    marginBottom: 20,
  },
});
