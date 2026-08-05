import { useEffect } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { errorToast } from '@C/shared/error-toast/error-toast';
import {
  useSendLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
  useDeleteLikeToCommentMutation,
} from '@R/services/comments/comments';
import { useSendEmailAfterSendingCommentLikeMutation } from '@R/services/emails/emails';
import { setCommentIdWhichLikesToUpdate } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { COMMENT_LIKE_BTN } from './const';
import type { CommentLikeBtnProps } from '../types';

export default function CommentLikeBtn({ commentId, commentLikesFromComment, profile, comment }: CommentLikeBtnProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ language }) => language);
  const { commentIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);

  const [sendLikeToComment, { isSuccess: isSuccessSending, isLoading: isSendingLike }] = useSendLikeToCommentMutation();
  const [deleteLikeToComment, { isSuccess: isSuccessDeleting, isLoading: isDeletingLike }] =
    useDeleteLikeToCommentMutation();
  const {
    isError: isErrorToGetLikes,
    data: commentLikes,
    isLoading: isLoadingLikes,
    isSuccess,
  } = useGetLikesByCommentIdQuery(commentId);
  const [sendEmailNotificationAfterSendingLike] = useSendEmailAfterSendingCommentLikeMutation();

  const shouldGetUpdatedCommentLikes = commentIdWhichLikesToUpdate === commentId;
  const whatCommentLikesToIterate = shouldGetUpdatedCommentLikes ? commentLikes : commentLikesFromComment;
  const youGaveCommentLike = whatCommentLikesToIterate?.length
    ? isSuccess && commentLikes?.filter(({ authorId }: { authorId: string }) => authorId === userId)
    : [];

  useEffect(() => {
    if (isSuccessSending || isSuccessDeleting) {
      if (profile?.emailNotifications) {
        sendEmailNotificationAfterSendingLike({
          name,
          surname,
          profilePhoto,
          comment,
          recepientName: profile?.name,
          recepientSurname: profile?.surname,
          recepientEmail: profile?.users.email,
        });
      }
      dispatch(setCommentIdWhichLikesToUpdate(commentId));
    }
  }, [
    isSuccessSending,
    isSuccessDeleting,
    language,
    dispatch,
    commentId,
    profile?.emailNotifications,
    sendEmailNotificationAfterSendingLike,
    name,
    surname,
    profilePhoto,
    comment,
    profile?.name,
    profile?.surname,
    profile.email,
    profile?.users.email,
  ]);

  return (
    <IconButton
      testID={`commentLikeBtn${youGaveCommentLike?.length ? '-active' : ''}`}
      icon={whatCommentLikesToIterate?.length ? 'cards-heart' : 'cards-heart-outline'}
      size={20}
      iconColor={youGaveCommentLike?.length ? 'red' : colors.primary}
      onPress={async () => {
        try {
          if (youGaveCommentLike?.length) {
            await deleteLikeToComment({ likeId: youGaveCommentLike[0].id, commentId }).unwrap();
          } else {
            await sendLikeToComment({ body: { commentId, authorId: userId }, commentId }).unwrap();
          }
        } catch (error) {
          errorToast(COMMENT_LIKE_BTN[language].errorSending, error);
        }
      }}
      disabled={isLoadingLikes || isErrorToGetLikes}
      loading={isSendingLike || isDeletingLike}
    />
  );
}
