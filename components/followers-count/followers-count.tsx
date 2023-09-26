import { useAuth } from '@auth/context/auth-context';
import ErrorComponent from '@c/error-component/error-component';
import { useGetFollowersByUserIdQuery } from '@r/runnich-api/runnich-api';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function FollowingCount() {
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
