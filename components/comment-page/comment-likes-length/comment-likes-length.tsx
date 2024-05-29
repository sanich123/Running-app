import { useAuth } from '@A/context/auth-context';
import { NUMBER_OF_LIKES } from '@C/card/number-of-likes/const';
import { useGetLikesByCommentIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { useEffect, useState } from 'react';
import { Text } from 'react-native-paper';

export default function CommentLikesLength({
  commentId,
  commentLikesFromComment,
}: {
  commentId: string;
  commentLikesFromComment: { authorId: string; id: string }[];
}) {
  const { user } = useAuth();
  const [isNeedToGetUpdatedCommentLikes, setIsNeedToGetUpdatedCommentLikes] = useState(false);
  const { language } = useAppSelector(({ language }) => language);
  const { commentIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const {
    data: commentLikes,
    error,
    isError,
  } = useGetLikesByCommentIdQuery(commentId, { skip: !isNeedToGetUpdatedCommentLikes });
  const whatCommentLikesToIterate = isNeedToGetUpdatedCommentLikes ? commentLikes : commentLikesFromComment;
  const youGaveCommentLike = whatCommentLikesToIterate?.length
    ? whatCommentLikesToIterate?.some(({ authorId }: { authorId: string }) => authorId === user?.id)
    : false;
  const commentLikesLength = youGaveCommentLike
    ? whatCommentLikesToIterate?.length - 1
    : whatCommentLikesToIterate?.length;

  useEffect(() => {
    if (commentIdWhichLikesToUpdate === commentId) {
      setIsNeedToGetUpdatedCommentLikes(true);
    }
  }, [commentIdWhichLikesToUpdate, commentId]);

  return (
    <>
      {!isError && whatCommentLikesToIterate?.length > 0 && (
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
