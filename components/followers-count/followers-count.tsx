import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetFollowersByUserIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function FollowersCount() {
  const { user } = useAuth();
  const { id: friendId } = useLocalSearchParams();
  const { isLoading, error, data: followers } = useGetFollowersByUserIdQuery(friendId ? friendId?.toString() : user.id);

  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {followers ? <Text variant="titleLarge">{followers?.length}</Text> : null}
    </>
  );
}
