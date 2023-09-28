import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { Suspense } from 'react';
import { Pressable, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetFriendsByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import AddFriendBtn from '../add-friend-btn/add-friend-btn';
import DeleteFriendBtn from '../delete-friend-btn/delete-friend-btn';
import ErrorComponent from '../error-component/error-component';
import FollowersCount from '../followers-count/followers-count';
import FollowingCount from '../following-count/following-count';

export default function ProfileFollowersSection() {
  const { id: friendId } = useLocalSearchParams();
  const { user } = useAuth();
  const { isLoading, error, data: listOfFriends } = useGetFriendsByUserIdQuery(user.id);
  const friendCell = listOfFriends?.filter(({ friendId: friendIdOnServer }) => friendIdOnServer === friendId);
  const isMineActivity = friendId === user.id;
  const router = useRouter();
  const pathname = usePathname();
  return (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 20, alignItems: 'center' }}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <Pressable
          onPress={() => router.push(`/${pathname.includes('home') ? 'home' : 'profile'}/following/${friendId}`)}>
          <View>
            <Text variant="bodySmall">Following</Text>
            <FollowingCount />
          </View>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/${pathname.includes('home') ? 'home' : 'profile'}/followers/${friendId}`)}>
          <View>
            <Text variant="bodySmall">Followers</Text>
            <FollowersCount />
          </View>
        </Pressable>
      </Suspense>

      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {!isMineActivity && friendId ? (
        !friendCell?.length ? (
          <AddFriendBtn friendId={friendId.toString()} />
        ) : (
          <DeleteFriendBtn friendId={friendId.toString()} />
        )
      ) : null}
    </View>
  );
}
