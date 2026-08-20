import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { COMMENT_EDIT_BTN } from './const';
import type { CommentEditBtnProps } from '../types';

export default function CommentEditBtn({ idOfUpdatingComment, commentId }: CommentEditBtnProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  return (
    (!idOfUpdatingComment || commentId !== idOfUpdatingComment) && (
      <IconButton
        testID="comment-edit-button"
        accessibilityLabel={COMMENT_EDIT_BTN[language].label}
        icon="pencil-outline"
        size={19}
        mode="contained-tonal"
        iconColor={colors.primary}
        containerColor={colors.primaryContainer}
        style={styles.button}
        onPress={() => {
          dispatch(setIsShowingTextInput(true));
          if (commentId !== idOfUpdatingComment) {
            dispatch(setIdOfUpdatingComment(commentId));
          } else {
            dispatch(setIdOfUpdatingComment(''));
            setIsShowingTextInput(false);
          }
        }}
      />
    )
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
