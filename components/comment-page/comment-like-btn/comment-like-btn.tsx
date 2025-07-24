import { setCommentIdWhichLikesToUpdate } from '@R/slices/main-feed/main-feed';
import {
  useSendLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
  useDeleteLikeToCommentMutation,
} from '@R/services/comments/comments';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { COMMENT_LIKE_BTN } from './const';
import { CommentLikeBtnProps } from '../types';
import { useSendEmailAfterSendingCommentLikeMutation } from '@R/services/emails/emails';

export default function CommentLikeBtn({ commentId, commentLikesFromComment, profile, comment }: CommentLikeBtnProps) {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ language }) => language);
  const { commentIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);
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
  const [sendEmailNotificationAfterSendingLike] = useSendEmailAfterSendingCommentLikeMutation();

  const whatCommentLikesToIterate = isNeedToGetUpdatedCommentLikes ? commentLikes : commentLikesFromComment;
  const youGaveCommentLike = whatCommentLikesToIterate?.length
    ? isSuccess && commentLikes?.filter(({ authorId }: { authorId: string }) => authorId === userId)
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
        showCrossPlatformToast(COMMENT_LIKE_BTN[language].errorSending);
      }
    }
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
    isErrorSending,
    isErrorDeleting,
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
      iconColor={youGaveCommentLike?.length ? MD3Colors.error50 : MD3Colors.primary50}
      onPress={async () =>
        youGaveCommentLike?.length
          ? await deleteLikeToComment({ likeId: youGaveCommentLike[0].id, commentId }).unwrap()
          : await sendLikeToComment({ body: { commentId, authorId: userId }, commentId }).unwrap()
      }
      disabled={isLoadingLikes || isErrorToGetLikes}
      loading={isSendingLike || isDeletingLike}
    />
  );
}
