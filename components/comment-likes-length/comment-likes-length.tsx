import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { useGetLikesByCommentIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';
import { NUMBER_OF_LIKES } from '../number-of-likes/const';

export default function CommentLikesLength({ id }: { id: string }) {
  const { user } = useAuth();
  const { isLoading, data: commentLikes, error } = useGetLikesByCommentIdQuery(id);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === user?.id);
  const commentLikesLength = youGaveCommentLike ? commentLikes?.length - 1 : commentLikes?.length;
  const { language } = useSelector(({ language }) => language);
  return (
    <>
      {isLoading && <ActivityIndicator size="small" />}
      {error ? <ErrorComponent error={error} /> : null}
      {commentLikes?.length ? (
        <Text variant="bodySmall" style={{ marginTop: 1 }}>
          {`${youGaveCommentLike ? NUMBER_OF_LIKES[language].you : ''}`}
          {`${youGaveCommentLike && commentLikesLength > 0 ? NUMBER_OF_LIKES[language].and : ''}`}
          {commentLikesLength > 0 ? `${commentLikesLength}` : ''}
          {commentLikesLength > 0 ? NUMBER_OF_LIKES[language].manyGaveLikes : NUMBER_OF_LIKES[language].oneGaveLikes}
        </Text>
      ) : null}
    </>
  );
}
