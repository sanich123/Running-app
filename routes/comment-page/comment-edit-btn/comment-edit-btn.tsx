import { IconButton, useTheme } from 'react-native-paper';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { useAppDispatch } from '@R/typed-hooks';
import type { CommentEditBtnProps } from '../types';

export default function CommentEditBtn({ idOfUpdatingComment, commentId }: CommentEditBtnProps) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  return (
    <>
      {(!idOfUpdatingComment || commentId !== idOfUpdatingComment) && (
        <IconButton
          icon="pencil"
          size={20}
          iconColor={colors.primary}
          onPress={() => {
            dispatch(setIsShowingTextInput(true));
            if (commentId !== idOfUpdatingComment) {
              dispatch(setIdOfUpdatingComment(commentId));
            } else {
              dispatch(setIdOfUpdatingComment(''));
              setIsShowingTextInput(false);
            }
          }}
          style={{ marginRight: -10 }}
        />
      )}
    </>
  );
}
