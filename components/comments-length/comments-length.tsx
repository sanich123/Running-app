import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';

import { useGetCommentsByActivityIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function CommentsLength({ activityId }: { activityId: string }) {
  const { error, data: comments } = useGetCommentsByActivityIdQuery(activityId);
  const { push } = useRouter();

  return (
    <>
      {error ? <ErrorComponent error={error} /> : null}
      {comments?.length ? (
        <Pressable
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
            marginRight: 15,
          }}
          onPress={() => push(`/home/comment/${activityId}`)}>
          <Text variant="bodyMedium">{comments?.length} comments</Text>
        </Pressable>
      ) : null}
    </>
  );
}
