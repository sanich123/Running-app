import { useEffect } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import {
  useSendLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
  useDeleteLikeToCommentMutation,
} from '@R/services/comments/comments';
import { useSendEmailAfterSendingCommentLikeMutation } from '@R/services/emails/emails';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { COMMENT_LIKE_BTN } from './const';
import type { CommentLikeBtnProps } from '../types';

export default function CommentLikeBtn({ commentId, commentLikesFromComment, profile, comment }: CommentLikeBtnProps) {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ language }) => language);
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
  } = useGetLikesByCommentIdQuery(commentId);
  const [sendEmailNotificationAfterSendingLike] = useSendEmailAfterSendingCommentLikeMutation();

  const whatCommentLikesToIterate = commentLikes ?? commentLikesFromComment ?? [];
  const youGaveCommentLike = whatCommentLikesToIterate?.length
    ? whatCommentLikesToIterate.filter(({ authorId }: { authorId: string }) => authorId === userId)
    : [];
  const hasLikesFromOthers = !!whatCommentLikesToIterate.length && !youGaveCommentLike.length;

  useEffect(() => {
    if (isSuccessSending || isSuccessDeleting) {
      if (profile?.emailNotifications && profile.users?.email) {
        sendEmailNotificationAfterSendingLike({
          name: name ?? '',
          surname: surname ?? '',
          profilePhoto: profilePhoto ?? '',
          comment,
          recepientName: profile.name ?? '',
          recepientSurname: profile.surname ?? '',
          recepientEmail: profile.users.email,
        });
      }
    }
  }, [
    isSuccessSending,
    isSuccessDeleting,
    language,
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
    profile?.users?.email,
  ]);

  return (
    <IconButton
      testID={`commentLikeBtn${youGaveCommentLike?.length ? '-active' : ''}`}
      icon={whatCommentLikesToIterate.length ? 'cards-heart' : 'cards-heart-outline'}
      size={youGaveCommentLike.length ? 24 : 20}
      iconColor={youGaveCommentLike.length ? colors.primary : hasLikesFromOthers ? colors.secondary : colors.primary}
      onPress={async () => {
        try {
          if (youGaveCommentLike?.length) {
            await deleteLikeToComment({ likeId: youGaveCommentLike[0].id, commentId }).unwrap();
          } else {
            await sendLikeToComment({ body: { commentId }, commentId }).unwrap();
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
