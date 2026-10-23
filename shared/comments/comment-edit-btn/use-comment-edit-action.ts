import { useCallback } from 'react';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { useAppDispatch } from '@R/typed-hooks';

export default function useCommentEditAction(commentId: string, comment: string) {
  const dispatch = useAppDispatch();

  return useCallback(() => {
    dispatch(setCommentToUpdate(comment));
    dispatch(setIdOfUpdatingComment(commentId));
  }, [comment, commentId, dispatch]);
}
