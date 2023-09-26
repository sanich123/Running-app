import { useAuth } from '@auth/context/auth-context';
import ErrorComponent from '@c/error-component/error-component';
import { useGetFriendsByUserIdQuery } from '@r/runnich-api/runnich-api';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function FollowingCount() {
  const { user } = useAuth();
  const { id: friendId } = useLocalSearchParams();
  const {
    isLoading,
    error,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery(friendId ? friendId?.toString() : user.id);
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {listOfFriends ? <Text variant="titleLarge">{listOfFriends?.length}</Text> : null}
    </>
  );
}
