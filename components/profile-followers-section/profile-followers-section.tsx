import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
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
  const router = useRouter();
  return (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
      <Pressable onPress={() => router.push(`/home/following/${friendId}`)}>
        <View>
          <Text variant="bodySmall">Following</Text>
          <FollowingCount />
        </View>
      </Pressable>
      <Pressable onPress={() => router.push(`/home/followers/${friendId}`)}>
        <View>
          <Text variant="bodySmall">Followers</Text>
          <FollowersCount />
        </View>
      </Pressable>

      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {!isMineActivity && friendId ? (
        !friendCell?.length ? (
          <AddFriendBtn friendId={friendId.toString()} />
        ) : (
          <DeleteFriendBtn idOfFriendCell={friendCell[0].id} />
        )
      ) : null}
    </View>
  );
}
