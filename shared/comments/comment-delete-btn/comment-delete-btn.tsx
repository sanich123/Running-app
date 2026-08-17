import { useEffect } from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { useDeleteCommentByCommentIdMutation } from '@R/services/comments/comments';
import { setActivityIdWhichCommentsToUpdate } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { COMMENT_DELETE_BTN } from './const';
import type { CommentDeleteButtonProps } from '../types';

export default function CommentDeleteBtn({ commentId, activityId }: CommentDeleteButtonProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const [deleteComment, { isSuccess: isSuccessDeleting, isLoading }] = useDeleteCommentByCommentIdMutation();

  useEffect(() => {
    if (isSuccessDeleting) {
      dispatch(setActivityIdWhichCommentsToUpdate(activityId));
    }
  }, [isSuccessDeleting, dispatch, activityId]);

  return (
    <IconButton
      icon="delete"
      iconColor={colors.primary}
      size={20}
      onPress={async () => {
        try {
          await deleteComment({ commentId, activityId }).unwrap();
        } catch (error) {
          errorToast(COMMENT_DELETE_BTN[language].errorDeleting, error);
        }
      }}
      disabled={isLoading}
    />
  );
}
