import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, ToastAndroid } from 'react-native';
import { ActivityIndicator, Button, MD2Colors, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { logOut } from '../../../../auth/firebase/email-auth';
import { View } from '../../../../components/Themed';
import AddFriendBtn from '../../../../components/add-friend-btn/add-friend-btn';
import AmountOfFriends from '../../../../components/amount-of-friends/amount-of-friends';
import AvatarShowable from '../../../../components/avatar/avatar-showable';
import ErrorComponent from '../../../../components/error-component/error-component';
import { useGetFriendsByUserIdQuery, useGetUserProfileByIdQuery } from '../../../../redux/runnich-api/runnich-api';
import { calculateAge } from '../../../../utils/time-formatter';

export default function Profile() {
  const { id: friendId } = useLocalSearchParams();
  const { id } = useSelector(({ userInfo }) => userInfo);
  const whoIsViewing = friendId && friendId !== id ? friendId : id;
  const { isLoading: isProfileLoading, error, data: profileInfo } = useGetUserProfileByIdQuery(whoIsViewing);
  const {
    isLoading: isListOfFriendsLoading,
    error: listOfFriendsError,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery(id);
  const isFriend = listOfFriends?.some((id) => id === friendId);
  useEffect(() => {
    if (listOfFriendsError) {
      ToastAndroid.show('Не удалось загрузить список друзей', ToastAndroid.SHORT);
    }
  }, [listOfFriendsError]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AvatarShowable size={100} id={whoIsViewing} />
        <View style={styles.nicknameWrapper}>
          <Text variant="headlineMedium">
            {profileInfo?.name || 'Your name'}
            {profileInfo?.surname || 'Your surname'}
          </Text>
          <Text variant="titleLarge">
            {profileInfo?.city || 'Your homeland'},
            {profileInfo?.birthday ? `${calculateAge(new Date(profileInfo?.birthday))} years old` : 'Your age'}
          </Text>
        </View>
      </View>
      <View style={styles.bio}>
        <Text variant="titleMedium">{profileInfo?.bio || 'Your biography'}</Text>
      </View>
      {isListOfFriendsLoading && <ActivityIndicator size="small" />}
      {listOfFriends?.length && <AmountOfFriends amountOfFriends={listOfFriends?.length} />}

      <Pressable>
        <Text variant="bodyLarge">Following</Text>
      </Pressable>
      {!isFriend && <AddFriendBtn friendId={friendId.toString()} />}
      {friendId && friendId === id && (
        <Button mode="outlined" icon="logout" onPress={() => logOut()} style={{ marginTop: 15 }}>
          LogOut
        </Button>
      )}
      {isProfileLoading && <ActivityIndicator animating color={MD2Colors.red800} />}
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
