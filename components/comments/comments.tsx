import { View, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useGetCommentsByActivityIdQuery } from '../../redux/runnich-api/runnich-api';
import { formatDate } from '../../utils/time-formatter';
import AvatarShowable from '../avatar/avatar-showable';
import UserNameSurname from '../user-name-surname/user-name-surname';

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
      {comments?.map(({ authorId, comment, id, date }) => (
        <View key={id}>
          <AvatarShowable size={25} id={authorId} />
          <UserNameSurname userId={authorId} />
          <Text>{formatDate(date)}</Text>
          <Text>{comment}</Text>
        </View>
      ))}
    </>
  );
}
