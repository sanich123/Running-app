import { useAuth } from '@A/context/auth-context';
import { setCommentIdWhichLikesToUpdate } from '@R/main-feed/main-feed';
import {
  useSendLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
  useDeleteLikeToCommentMutation,
} from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { COMMENT_LIKE_BTN, CommentLikeBtnProps } from './const';

export default function CommentLikeBtn({ commentId, commentLikesFromComment }: CommentLikeBtnProps) {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const { commentIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const [isNeedToGetUpdatedCommentLikes, setIsNeedToGetUpdatedCommentLikes] = useState(false);

  const [sendLikeToComment, { isSuccess: isSuccessSending, isError: isErrorSending, isLoading: isSendingLike }] =
    useSendLikeToCommentMutation();
  const [deleteLikeToComment, { isSuccess: isSuccessDeleting, isError: isErrorDeleting, isLoading: isDeletingLike }] =
    useDeleteLikeToCommentMutation();
  const {
    isError: isErrorToGetLikes,
    data: commentLikes,
    isLoading: isLoadingLikes,
    isSuccess,
  } = useGetLikesByCommentIdQuery(commentId);

  const whatCommentLikesToIterate = isNeedToGetUpdatedCommentLikes ? commentLikes : commentLikesFromComment;
  const youGaveCommentLike = whatCommentLikesToIterate?.length
    ? isSuccess && commentLikes?.filter(({ authorId }: { authorId: string }) => authorId === user?.id)
    : [];

  useEffect(() => {
    if (commentIdWhichLikesToUpdate === commentId) {
      setIsNeedToGetUpdatedCommentLikes(true);
    }
  }, [commentIdWhichLikesToUpdate, commentId]);

  useEffect(() => {
    if (isErrorSending || isErrorDeleting) {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast(COMMENT_LIKE_BTN[language].errorSending);
      } else {
        toast.show(COMMENT_LIKE_BTN[language].errorSending);
      }
    }
    if (isSuccessSending || isSuccessDeleting) {
      dispatch(setCommentIdWhichLikesToUpdate(commentId));
    }
  }, [isErrorSending, isErrorDeleting, isSuccessSending, isSuccessDeleting, language, toast, dispatch, commentId]);

  return (
    <IconButton
      testID={`commentLikeBtn${youGaveCommentLike?.length ? '-active' : ''}`}
      icon={whatCommentLikesToIterate?.length ? 'cards-heart' : 'cards-heart-outline'}
      size={20}
      iconColor={youGaveCommentLike?.length ? MD3Colors.error50 : MD3Colors.primary50}
      onPress={async () =>
        youGaveCommentLike?.length
          ? await deleteLikeToComment({ likeId: youGaveCommentLike[0].id, commentId }).unwrap()
          : await sendLikeToComment({ body: { commentId, authorId: `${user?.id}` }, commentId }).unwrap()
      }
      disabled={isLoadingLikes || isErrorToGetLikes}
      loading={isSendingLike || isDeletingLike}
    />
  );
}
