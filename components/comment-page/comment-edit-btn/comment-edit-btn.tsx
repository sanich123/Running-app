import { IconButton, MD3Colors } from 'react-native-paper';

export default function CommentEditBtn({
  idOfUpdatingComment,
  setIsShowingTextInput,
  setIdOfUpdatingComment,
  commentId,
}: {
  idOfUpdatingComment: string;
  setIsShowingTextInput: (arg: boolean) => void;
  setIdOfUpdatingComment: (arg: string) => void;
  commentId: string;
}) {
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
