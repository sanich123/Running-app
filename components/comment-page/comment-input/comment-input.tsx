import { useAuth } from '@A/context/auth-context';
import { setActivityIdWhichCommentsToUpdate } from '@R/main-feed/main-feed';
import { usePostCommentWithActivityIdMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { COMMENT_ICON_TEST_ID, COMMENT_INPUT, COMMENT_INPUT_TEST_ID, CommentInputProps } from './const';

export default function CommentInput({ activityId, setIsShowingTextInput }: CommentInputProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [postComment, { isLoading: isCommentSending, isSuccess, isError }] = usePostCommentWithActivityIdMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setActivityIdWhichCommentsToUpdate(activityId));
      setIsShowingTextInput(false);
      setComment('');
    }
    if (isError) {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast(COMMENT_INPUT[language].errorSending);
      } else {
        toast.show(COMMENT_INPUT[language].errorSending);
      }
    }
  }, [isError, isSuccess]);

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
          disabled={!comment}
          onPress={async () =>
            await postComment({ body: { comment, authorId: `${user?.id}` }, id: activityId }).unwrap()
          }
        />
      }
      onSubmitEditing={async () => {
        if (comment) {
          await postComment({ body: { comment, authorId: `${user?.id}` }, id: activityId }).unwrap();
        }
      }}
      label={COMMENT_INPUT[language].label}
      autoFocus
      returnKeyType="send"
    />
  );
}
