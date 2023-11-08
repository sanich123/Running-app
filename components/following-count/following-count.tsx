import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetFriendsByUserIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function FollowingCount() {
  const { user } = useAuth();
  const { push } = useRouter();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const { isLoading, error, data: listOfFriends } = useGetFriendsByUserIdQuery((friendId as string) ?? user.id);

  return (
    <Pressable onPress={() => push(`/${pathname.includes('home') ? 'home' : 'profile'}/following/${friendId}`)}>
      <Text variant="bodySmall">Following</Text>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {listOfFriends ? <Text variant="titleLarge">{listOfFriends?.length}</Text> : null}
    </Pressable>
  );
}
