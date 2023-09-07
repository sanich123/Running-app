import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useGetFriendsByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import AddFriendBtn from '../add-friend-btn/add-friend-btn';
import DeleteFriendBtn from '../delete-friend-btn/delete-friend-btn';
import ErrorComponent from '../error-component/error-component';
import FollowersCount from '../followers-count/followers-count';
import FollowingCount from '../following-count/following-count';

export default function ProfileFollowersSection() {
  const { id: friendId } = useLocalSearchParams();
  const { id } = useSelector(({ userInfo }) => userInfo);
  const { isLoading, error, data: listOfFriends } = useGetFriendsByUserIdQuery(id);
  const friendCell = listOfFriends?.filter(({ friendId: friendIdOnServer }) => friendIdOnServer === friendId);
  const isMineActivity = friendId === id;
  return (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
      <View>
        <Text variant="bodySmall">Following</Text>
        <FollowingCount />
      </View>
      <View>
        <Text variant="bodySmall">Followers</Text>
        <FollowersCount />
      </View>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {!isMineActivity ? (
        !friendCell?.length ? (
          <AddFriendBtn friendId={friendId.toString()} />
        ) : (
          <DeleteFriendBtn idOfFriendCell={friendCell[0].id} />
        )
      ) : null}
    </View>
  );
}
