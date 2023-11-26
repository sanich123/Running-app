import { useAuth } from '@A/context/auth-context';
import { usePostCommentWithActivityIdMutation } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { TextInput } from 'react-native-paper';

import { COMMENT_ICON_TEST_ID, COMMENT_INPUT, COMMENT_INPUT_TEST_ID } from './const';

export default function CommentInput({ activityId }: { activityId: string }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [postComment, { isLoading: isCommentSending, error: commentSendingError, data: commentResponse }] =
    usePostCommentWithActivityIdMutation();
  const { language } = useAppSelector(({ language }) => language);

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
      testID={COMMENT_INPUT_TEST_ID}
      mode="outlined"
      style={{ marginTop: 'auto', marginBottom: 20 }}
      placeholder={COMMENT_INPUT[language].placeholder}
      value={comment}
      onChangeText={(comment) => setComment(comment)}
      disabled={isCommentSending}
      right={
        <TextInput.Icon
          testID={COMMENT_ICON_TEST_ID}
          icon="pencil"
          onPress={async () => {
            if (user) {
              const body = { comment, authorId: user.id };
              try {
                await postComment({ body, id: activityId }).unwrap();
              } catch (error) {
                errorHandler(error);
              }
            }
          }}
        />
      }
      label={COMMENT_INPUT[language].label}
      autoFocus
    />
  );
}
