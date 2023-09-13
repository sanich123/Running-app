import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { TextInput } from 'react-native-paper';

import { usePostCommentWithActivityIdMutation } from '../../redux/runnich-api/runnich-api';
import { errorHandler } from '../../utils/error-handler';

export default function CommentInput({ userId, activityId }: { userId: string; activityId: string }) {
  const [comment, setComment] = useState('');
  const [postComment, { isLoading: isCommentSending, error: commentSendingError, data: commentResponse }] =
    usePostCommentWithActivityIdMutation();

  useEffect(() => {
    if (commentResponse) {
      ToastAndroid.show('Successfully sent comment!', ToastAndroid.SHORT);
      console.log(commentResponse);
      setComment('');
    }
    if (commentSendingError) {
      ToastAndroid.show('An error occured!', ToastAndroid.SHORT);
      console.log(commentSendingError);
    }
  }, [commentSendingError, commentResponse]);
  return (
    <TextInput
      mode="outlined"
      style={{ marginTop: 'auto', marginBottom: 20 }}
      placeholder="Add a comment"
      value={comment}
      onChangeText={(comment) => setComment(comment)}
      disabled={isCommentSending}
      right={
        <TextInput.Icon
          icon="pencil"
          onPress={async () => {
            const body = { comment, authorId: userId };
            try {
              await postComment({ body, id: activityId }).unwrap();
            } catch (error) {
              errorHandler(error);
            }
          }}
        />
      }
      label="Comment"
      autoFocus
    />
  );
}
