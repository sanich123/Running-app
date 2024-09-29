import { IconButton, MD3Colors } from 'react-native-paper';
import { CommentEditBtnProps } from '../types';

export default function CommentEditBtn({
  idOfUpdatingComment,
  setIsShowingTextInput,
  setIdOfUpdatingComment,
  commentId,
}: CommentEditBtnProps) {
  return (
    <>
      {(!idOfUpdatingComment || commentId !== idOfUpdatingComment) && (
        <IconButton
          icon={'pencil'}
          size={20}
          iconColor={MD3Colors.primary50}
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
