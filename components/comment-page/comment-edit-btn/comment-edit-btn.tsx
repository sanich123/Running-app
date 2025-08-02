import { IconButton, useTheme } from 'react-native-paper';
import { CommentEditBtnProps } from '../types';

export default function CommentEditBtn({
  idOfUpdatingComment,
  setIsShowingTextInput,
  setIdOfUpdatingComment,
  commentId,
}: CommentEditBtnProps) {
  const { colors } = useTheme();
  return (
    <>
      {(!idOfUpdatingComment || commentId !== idOfUpdatingComment) && (
        <IconButton
          icon={'pencil'}
          size={20}
          iconColor={colors.primary}
          onPress={() => {
            setIsShowingTextInput(true);
            if (commentId !== idOfUpdatingComment) {
              setIdOfUpdatingComment(commentId);
            } else {
              setIdOfUpdatingComment('');
              setIsShowingTextInput(false);
            }
          }}
          style={{ marginRight: -10 }}
        />
      )}
    </>
  );
}
