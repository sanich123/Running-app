import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { useGetCommentsByActivityIdQuery } from '../../redux/runnich-api/runnich-api';
import { formatDate } from '../../utils/time-formatter';
import AvatarShowable from '../avatar/avatar-showable';
import ErrorComponent from '../error-component/error-component';
import UserNameSurname from '../user-name-surname/user-name-surname';

export default function Comments({ id }: { id: string }) {
  const { isLoading, error, data: comments } = useGetCommentsByActivityIdQuery(id);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {comments?.map(({ authorId, comment, id, date }) => (
        <>
          <View
            key={id}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: 10,
              paddingTop: 5,
              paddingLeft: 10,
            }}>
            <AvatarShowable size={25} id={authorId} />
            <View style={{ display: 'flex' }}>
              <UserNameSurname userId={authorId} size="bodyMedium" />
              <Text variant="bodySmall">{formatDate(date)}</Text>
            </View>
          </View>
          <View style={{ paddingTop: 5, paddingLeft: 10 }}>
            <Text variant="bodyLarge">{comment}</Text>
          </View>
        </>
      ))}
    </>
  );
}
