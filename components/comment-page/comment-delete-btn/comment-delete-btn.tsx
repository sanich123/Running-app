import { setActivityIdWhichCommentsToUpdate } from '@R/slices/main-feed/main-feed';
import { useDeleteCommentByCommentIdMutation } from '@R/services/comments/comments';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

import { COMMENT_DELETE_BTN } from './const';
import { ComentDeleteBtnProps } from '../types';

export default function CommentDeleteBtn({ commentId, activityId }: ComentDeleteBtnProps) {
  const { colors } = useTheme();
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
        showCrossPlatformToast(COMMENT_DELETE_BTN[language].errorDeleting);
      } else {
        showCrossPlatformToast(COMMENT_DELETE_BTN[language].errorDeleting);
      }
    }
  }, [isSuccessDeleting, isErrorDeleting, dispatch, activityId, language]);

  return (
    <IconButton
      icon="delete"
      iconColor={colors.primary}
      size={20}
      onPress={async () => await deleteComment({ commentId, activityId }).unwrap()}
      disabled={isLoading}
    />
  );
}
