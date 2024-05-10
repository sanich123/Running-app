import { useAuth } from '@A/context/auth-context';
import { NUMBER_OF_LIKES } from '@C/card/number-of-likes/const';
import { useGetLikesByCommentIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { Text } from 'react-native-paper';

export default function CommentLikesLength({ id }: { id: string }) {
  const { user } = useAuth();
  const { data: commentLikes, error, isError } = useGetLikesByCommentIdQuery(id);
  const youGaveCommentLike = commentLikes?.some(({ authorId }: { authorId: string }) => authorId === user?.id);
  const commentLikesLength = youGaveCommentLike ? commentLikes?.length - 1 : commentLikes?.length;
  const { language } = useAppSelector(({ language }) => language);
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
