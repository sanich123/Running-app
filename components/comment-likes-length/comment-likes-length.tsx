import ErrorComponent from '@c/error-component/error-component';
import { useGetLikesByCommentIdQuery } from '@r/runnich-api/runnich-api';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function CommentLikesLength({ id }: { id: string }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const { isLoading, data: commentLikes, error } = useGetLikesByCommentIdQuery(id);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === ownerId);
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
