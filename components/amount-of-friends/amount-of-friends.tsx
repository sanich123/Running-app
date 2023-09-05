import { ActivityIndicator, Text } from 'react-native-paper';

import { useGetFriendsByUserIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function AmountOfFriends({ id }: { id: string }) {
  const { isLoading, error, data: listOfFriends } = useGetFriendsByUserIdQuery(id);
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error ? <ErrorComponent error={error} /> : null}
      {listOfFriends ? <Text variant="bodyLarge">{`Friends ${listOfFriends.length}`}</Text> : null}
    </>
  );
}
