import { useAuth } from '@A/context/auth-context';
import {
  useSendLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
  useDeleteLikeToCommentMutation,
} from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { COMMENT_LIKE_BTN } from './const';

export default function CommentLikeBtn({ commentId }: { commentId: string }) {
  const { user } = useAuth();
  const toast = useToast();
  const { language } = useAppSelector(({ language }) => language);
  const [isLoading, setIsLoading] = useState(false);

  const [sendLikeToComment, { isSuccess: isSuccessSending, isError: isErrorSending }] = useSendLikeToCommentMutation();
  const [deleteLikeToComment, { isSuccess: isSuccessDeleting, error: isErrorDeleting }] =
    useDeleteLikeToCommentMutation();
  const {
    isError: isErrorToGetLikes,
    data: commentLikes,
    isLoading: isLoadingLikes,
  } = useGetLikesByCommentIdQuery(commentId);
  const youGaveCommentLike = commentLikes?.length
    ? commentLikes?.filter(({ authorId }: { authorId: string }) => authorId === user?.id)
    : [];

  useEffect(() => {
    if (isErrorSending || isErrorDeleting) {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast(COMMENT_LIKE_BTN[language].errorSending);
      } else {
        toast.show(COMMENT_LIKE_BTN[language].errorSending);
      }
      setIsLoading(false);
    }
    if (isSuccessSending || isSuccessDeleting) {
      setIsLoading(false);
    }
  }, [isErrorSending, isErrorDeleting, isSuccessSending, isSuccessDeleting]);

  return (
    <IconButton
      testID={`commentLikeBtn${youGaveCommentLike?.length ? '-active' : ''}`}
      icon={commentLikes?.length ? 'cards-heart' : 'cards-heart-outline'}
      size={20}
      iconColor={youGaveCommentLike?.length ? MD3Colors.error50 : MD3Colors.primary50}
      onPress={async () => {
        setIsLoading(true);
        if (youGaveCommentLike?.length) {
          await deleteLikeToComment({ likeId: youGaveCommentLike[0].id, commentId }).unwrap();
        } else {
          await sendLikeToComment({ body: { commentId, authorId: `${user?.id}` }, commentId }).unwrap();
        }
      }}
      disabled={isLoading || isErrorToGetLikes || isLoadingLikes}
    />
  );
}
