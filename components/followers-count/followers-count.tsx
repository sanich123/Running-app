import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetFollowersByUserIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function FollowersCount() {
  const { user } = useAuth();
  const { id: friendId } = useLocalSearchParams();
  const { isLoading, error, data: followers } = useGetFollowersByUserIdQuery(friendId ? (friendId as string) : user.id);
  const pathname = usePathname();
  const { push } = useRouter();

  return (
    <Pressable onPress={() => push(`/${pathname.includes('home') ? 'home' : 'profile'}/followers/${friendId}`)}>
      <Text variant="bodySmall">Followers</Text>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {followers ? <Text variant="titleLarge">{followers?.length}</Text> : null}
    </Pressable>
  );
}
