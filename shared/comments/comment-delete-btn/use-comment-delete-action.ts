import { useCallback } from 'react';
import { useDeleteCommentByCommentIdMutation } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { COMMENT_DELETE_BTN } from './const';

export default function useCommentDeleteAction(commentId: string, activityId: string) {
  const { language } = useAppSelector(({ settings }) => settings);
  const [deleteComment, { isLoading }] = useDeleteCommentByCommentIdMutation();

  const onDelete = useCallback(async () => {
    try {
      await deleteComment({ commentId, activityId }).unwrap();
    } catch (error) {
      errorToast(COMMENT_DELETE_BTN[language].errorDeleting, error);
    }
  }, [activityId, commentId, deleteComment, language]);

  return { onDelete, isLoading };
}
