import { Text } from 'react-native-paper';
import { NUMBER_OF_LIKES } from '@C/card/number-of-likes/const';
import { useGetLikesByCommentIdQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import type { CommentLikesLengthProps } from '../types';

export default function CommentLikesLength({ commentId, commentLikesFromComment }: CommentLikesLengthProps) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ language }) => language);
  const { commentIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);

  const shouldGetUpdatedCommentLikes = commentIdWhichLikesToUpdate === commentId;
  const {
    data: commentLikes,
    error,
    isError,
  } = useGetLikesByCommentIdQuery(commentId, {
    skip: !shouldGetUpdatedCommentLikes,
  });

  const whatCommentLikesToIterate = shouldGetUpdatedCommentLikes ? commentLikes : commentLikesFromComment;
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
      {isError && <Text variant="bodySmall">{`An error: ${errorExtracter(error)}`}</Text>}
    </>
  );
}
