import { View, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useGetCommentsByActivityIdQuery } from '../../redux/runnich-api/runnich-api';

export default function Comments({ id }: { id: string }) {
  const { isLoading, error, data: comments } = useGetCommentsByActivityIdQuery(id);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error && (
        <View>
          <Text>An error occured</Text>
        </View>
      )}
      {comments.map(({ authorId, comment, id }) => (
        <View key={id}>
          <Text>{authorId}</Text>
          <Text>{comment}</Text>
        </View>
      ))}
    </>
  );
}
