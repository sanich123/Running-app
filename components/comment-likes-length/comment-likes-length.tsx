import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import { useGetLikesByCommentIdQuery } from '../../redux/runich-api/runich-api';
import { errorExtracter } from '../../utils/error-handler';
import { NUMBER_OF_LIKES } from '../number-of-likes/const';

export default function CommentLikesLength({ id }: { id: string }) {
  const { user } = useAuth();
  const { data: commentLikes, error, isError } = useGetLikesByCommentIdQuery(id);
  const youGaveCommentLike = commentLikes?.some(({ authorId }) => authorId === user?.id);
  const commentLikesLength = youGaveCommentLike ? commentLikes?.length - 1 : commentLikes?.length;
  const { language } = useSelector(({ language }) => language);
  return (
    <>
      {!isError && commentLikes?.length > 0 && (
        <Text variant="bodySmall" style={{ marginTop: 1 }}>
          {`${youGaveCommentLike ? NUMBER_OF_LIKES[language].you : ''}`}
          {`${youGaveCommentLike && commentLikesLength > 0 ? NUMBER_OF_LIKES[language].and : ''}`}
          {commentLikesLength > 0 ? `${commentLikesLength} ` : ''}
          {commentLikesLength > 0 ? NUMBER_OF_LIKES[language].manyGaveLikes : NUMBER_OF_LIKES[language].oneGaveLikes}
        </Text>
      )}
      {isError && <Text variant="bodySmall">{`An error: ${errorExtracter(error)}`}</Text>}
    </>
  );
}
