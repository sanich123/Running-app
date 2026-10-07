import { useCallback, useState } from 'react';
import { Animated } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import {
  useSendLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
  useDeleteLikeToCommentMutation,
} from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { COMMENT_LIKE_BTN } from './const';
import type { CommentLikeBtnProps } from '../types';

export default function CommentLikeBtn({ activityId, commentId, commentLikesFromComment }: CommentLikeBtnProps) {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);

  const [sendLikeToComment, { isLoading: isSendingLike }] = useSendLikeToCommentMutation();
  const [deleteLikeToComment, { isLoading: isDeletingLike }] = useDeleteLikeToCommentMutation();
  const [optimisticLike, setOptimisticLike] = useState<{ authorId: string; id: string } | null>(null);
  const {
    isError: isErrorToGetLikes,
    data: commentLikes,
    isLoading: isLoadingLikes,
  } = useGetLikesByCommentIdQuery(commentId, {
    skip: !commentId || (!commentLikesFromComment.length && !optimisticLike),
  });

  const whatCommentLikesToIterate = [...(commentLikes ?? commentLikesFromComment ?? [])];
  if (optimisticLike && !whatCommentLikesToIterate.some(({ id }) => id === optimisticLike.id)) {
    whatCommentLikesToIterate.push(optimisticLike);
  }
  const youGaveCommentLike = whatCommentLikesToIterate?.length
    ? whatCommentLikesToIterate.filter(({ authorId }: { authorId: string }) => authorId === userId)
    : [];
  const hasLikesFromOthers = !!whatCommentLikesToIterate.length && !youGaveCommentLike.length;
  const [likeScale] = useState(() => new Animated.Value(1));

  const animateLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 0.82,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  }, [likeScale]);

  return (
    <Animated.View style={{ transform: [{ scale: likeScale }] }}>
      <IconButton
        testID={`commentLikeBtn${youGaveCommentLike?.length ? '-active' : ''}`}
        icon={whatCommentLikesToIterate.length ? 'cards-heart' : 'cards-heart-outline'}
        size={youGaveCommentLike.length ? 24 : 20}
        iconColor={youGaveCommentLike.length ? colors.primary : hasLikesFromOthers ? colors.secondary : colors.primary}
        onPress={async () => {
          animateLike();
          try {
            if (youGaveCommentLike?.length) {
              await deleteLikeToComment({ likeId: youGaveCommentLike[0].id, commentId }).unwrap();
              setOptimisticLike(null);
            } else {
              const result = await sendLikeToComment({ body: { commentId }, commentId, activityId }).unwrap();
              setOptimisticLike({ id: result.id, authorId: result.authorId ?? userId });
            }
          } catch (error) {
            errorToast(COMMENT_LIKE_BTN[language].errorSending, error);
          }
        }}
        disabled={isLoadingLikes || isErrorToGetLikes}
        loading={isSendingLike || isDeletingLike}
      />
    </Animated.View>
  );
}
