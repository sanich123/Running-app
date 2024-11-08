import { setActivityIdWhichCommentsToUpdate } from '@R/main-feed/main-feed';
import { useDeleteCommentByCommentIdMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { COMMENT_DELETE_BTN } from './const';
import { ComentDeleteBtnProps } from '../types';

export default function CommentDeleteBtn({ commentId, activityId }: ComentDeleteBtnProps) {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const [deleteComment, { isSuccess: isSuccessDeleting, isError: isErrorDeleting, isLoading }] =
    useDeleteCommentByCommentIdMutation();

  useEffect(() => {
    if (isSuccessDeleting) {
      dispatch(setActivityIdWhichCommentsToUpdate(activityId));
    }
    if (isErrorDeleting) {
      if (Platform.OS === 'web') {
        toast.show(COMMENT_DELETE_BTN[language].errorDeleting);
      } else {
        showCrossPlatformToast(COMMENT_DELETE_BTN[language].errorDeleting);
      }
    }
  }, [isSuccessDeleting, isErrorDeleting, dispatch, activityId, toast, language]);

  return (
    <IconButton
      icon="delete"
      iconColor={MD3Colors.primary50}
      size={20}
      onPress={async () => await deleteComment({ commentId, activityId }).unwrap()}
      disabled={isLoading}
    />
  );
}
