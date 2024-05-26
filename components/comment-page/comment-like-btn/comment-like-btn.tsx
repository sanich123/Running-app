import { useAuth } from '@A/context/auth-context';
import {
  useSendLikeToCommentMutation,
  useGetLikesByCommentIdQuery,
  useDeleteLikeToCommentMutation,
} from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { MD3Colors } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { COMMENT_LIKE_BTN } from './const';

export default function CommentLikeBtn({ commentId }: { commentId: string }) {
  const { language } = useAppSelector(({ language }) => language);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [sendLikeToComment, { isSuccess: isSuccessSending, isError: isErrorSending }] = useSendLikeToCommentMutation();
  const [deleteLikeToComment, { isSuccess: isSuccessDeleting, error: isErrorDeleting }] =
    useDeleteLikeToCommentMutation();
  const { isError: isErrorToGetLikes, data: commentLikes } = useGetLikesByCommentIdQuery(commentId);
  const youGaveCommentLike = commentLikes?.filter(({ authorId }: { authorId: string }) => authorId === user?.id);

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
    <MaterialCommunityIcons
      testID={`commentLikeBtn${youGaveCommentLike?.length ? '-active' : ''}`}
      name={`heart${commentLikes?.length ? '' : '-outline'}`}
      size={20}
      style={[{ marginLeft: 10, marginBottom: 10 }, (isLoading || isErrorToGetLikes) && { opacity: 0.5 }]}
      color={youGaveCommentLike ? MD3Colors.error50 : MD3Colors.primary50}
      onPress={async () => {
        setIsLoading(true);
        if (youGaveCommentLike?.length) {
          await deleteLikeToComment({ likeId: youGaveCommentLike[0].id, commentId }).unwrap();
        } else {
          await sendLikeToComment({ body: { commentId, authorId: `${user?.id}` }, commentId }).unwrap();
        }
      }}
      disabled={isLoading || isErrorToGetLikes}
    />
  );
}
