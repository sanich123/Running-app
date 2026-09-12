import { Text } from 'react-native-paper';
import { useGetLikesByCommentIdQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import { NUMBER_OF_LIKES } from '@S/card/number-of-likes/const';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import type { CommentLikesLengthProps } from '../types';

export default function CommentLikesLength({ commentId, commentLikesFromComment }: CommentLikesLengthProps) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    data: commentLikes,
    error,
    isError,
  } = useGetLikesByCommentIdQuery(commentId, {
    skip: !commentId || commentLikesFromComment.length === 0,
  });

  const whatCommentLikesToIterate = commentLikes ?? commentLikesFromComment ?? [];
  const youGaveCommentLike = whatCommentLikesToIterate?.length
    ? whatCommentLikesToIterate?.some(({ authorId }: { authorId: string }) => authorId === userId)
    : false;
  const commentLikesLength = youGaveCommentLike
    ? whatCommentLikesToIterate?.length - 1
    : whatCommentLikesToIterate?.length;

  return (
    <>
      {whatCommentLikesToIterate?.length > 0 && (
        <Text variant="bodySmall" style={{ marginTop: 1 }}>
          {`${youGaveCommentLike ? NUMBER_OF_LIKES[language].you : ''}`}
          {`${youGaveCommentLike && commentLikesLength > 0 ? NUMBER_OF_LIKES[language].and : ''}`}
          {commentLikesLength > 0 ? `${commentLikesLength} ` : ''}
          {commentLikesLength > 0 ? NUMBER_OF_LIKES[language].manyGaveLikes : NUMBER_OF_LIKES[language].oneGaveLikes}
        </Text>
      )}
      {isError && <Text variant="bodySmall">{`An error: ${getErrorMessageFromError(error)}`}</Text>}
    </>
  );
}
