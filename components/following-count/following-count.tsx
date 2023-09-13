import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useGetFriendsByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function FollowingCount() {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const { id: friendId } = useLocalSearchParams();
  const {
    isLoading,
    error,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery(friendId ? friendId?.toString() : ownerId);
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {listOfFriends ? <Text variant="titleLarge">{listOfFriends?.length}</Text> : null}
    </>
  );
}
