import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useGetFriendsByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function FollowingCount() {
  const { id: friendId } = useLocalSearchParams();
  const { isLoading, error, data: listOfFriends } = useGetFriendsByUserIdQuery(friendId.toString());
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {listOfFriends ? <Text variant="titleLarge">{listOfFriends?.length}</Text> : null}
    </>
  );
}
