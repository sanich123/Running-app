import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useGetFollowersByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function FollowingCount() {
  const { id: friendId } = useLocalSearchParams();
  const { isLoading, error, data: followers } = useGetFollowersByUserIdQuery(friendId.toString());
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error && <ErrorComponent error={error} />}
      {followers ? <Text variant="titleLarge">{followers?.length}</Text> : null}
    </>
  );
}
