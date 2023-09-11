import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useGetLikesByCommentIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function CommentLikesLength({ id }: { id: string }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const { isLoading, data: commentLikes, error } = useGetLikesByCommentIdQuery(id);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === ownerId);
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error ? <ErrorComponent error={error} /> : null}
      {commentLikes?.length ? (
        <Text variant="bodySmall" style={{ marginTop: 1 }}>
          {`${youGaveCommentLike ? 'You  and ' : ''}${commentLikes?.length} gave like`}
        </Text>
      ) : null}
    </>
  );
}
