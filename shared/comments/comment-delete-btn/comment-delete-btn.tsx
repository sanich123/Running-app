import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useDeleteCommentByCommentIdMutation } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { COMMENT_DELETE_BTN } from './const';
import type { CommentDeleteButtonProps } from '../types';

export default function CommentDeleteBtn({ commentId, activityId }: CommentDeleteButtonProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const [deleteComment, { isLoading }] = useDeleteCommentByCommentIdMutation();

  return (
    <IconButton
      testID="comment-delete-button"
      accessibilityLabel={COMMENT_DELETE_BTN[language].label}
      icon="delete-outline"
      iconColor={colors.error}
      containerColor={colors.errorContainer}
      mode="contained-tonal"
      size={19}
      loading={isLoading}
      style={styles.button}
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

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    height: 40,
    margin: 0,
    width: 40,
  },
});
