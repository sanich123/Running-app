import { ActivityIndicator, Text } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useGetLikesByCommentIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function CommentLikesLength({ id }: { id: string }) {
  const { user } = useAuth();
  const { isLoading, data: commentLikes, error } = useGetLikesByCommentIdQuery(id);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === user?.id);
  const commentLikesLength = youGaveCommentLike ? commentLikes?.length - 1 : commentLikes?.length;
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error ? <ErrorComponent error={error} /> : null}
      {commentLikes?.length ? (
        <Text variant="bodySmall" style={{ marginTop: 1 }}>
          {`${youGaveCommentLike ? 'You ' : ''}`}
          {`${youGaveCommentLike && commentLikesLength > 0 ? 'and ' : ''}`}
          {commentLikesLength > 0 ? `${commentLikesLength}` : ''} gave like
        </Text>
      ) : null}
    </>
  );
}
