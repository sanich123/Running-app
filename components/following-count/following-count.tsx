import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetFriendsByUserIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

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
