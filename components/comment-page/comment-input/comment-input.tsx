import { useAuth } from '@A/context/auth-context';
import { setActivityIdWhichCommentsToUpdate } from '@R/main-feed/main-feed';
import { usePostCommentWithActivityIdMutation, useUpdateCommentByCommentIdMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { COMMENT_ICON_TEST_ID, COMMENT_INPUT, COMMENT_INPUT_TEST_ID } from './const';
import { CommentInputProps } from '../types';

export default function CommentInput({
  commentToUpdate = '',
  activityId,
  setIsShowingTextInput,
  commentId = '',
  setIdOfUpdatingComment,
  idOfUpdatingComment,
}: CommentInputProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();
  const [comment, setComment] = useState(commentToUpdate);
  const [postComment, { isLoading: isCommentSending, isSuccess: isSuccessSending, isError }] =
    usePostCommentWithActivityIdMutation();
  const [updateComment, { isLoading: isUpdatingComment, isSuccess: isSuccessUpdating, isError: isErrorUpdating }] =
    useUpdateCommentByCommentIdMutation();

  useEffect(() => {
    if (isSuccessSending || isSuccessUpdating) {
      dispatch(setActivityIdWhichCommentsToUpdate(activityId));
      setIsShowingTextInput(false);
      setIdOfUpdatingComment('');
      setComment('');
    }
    if (isError || isErrorUpdating) {
      if (Platform.OS !== 'web') {
        showCrossPlatformToast(COMMENT_INPUT[language].errorSending);
      } else {
        toast.show(COMMENT_INPUT[language].errorSending);
      }
    }
  }, [
    activityId,
    dispatch,
    isError,
    isErrorUpdating,
    isSuccessSending,
    isSuccessUpdating,
    language,
    setIdOfUpdatingComment,
    setIsShowingTextInput,
    toast,
  ]);

  return (
    <TextInput
      testID={COMMENT_INPUT_TEST_ID}
      mode="outlined"
      placeholder={COMMENT_INPUT[language].placeholder}
      value={comment}
      onChangeText={(comment) => setComment(comment)}
      onBlur={() => {
        setIdOfUpdatingComment('');
        setIsShowingTextInput(false);
      }}
      disabled={isCommentSending || isUpdatingComment}
      right={
        <TextInput.Icon
          testID={COMMENT_ICON_TEST_ID}
          icon="pencil"
          disabled={!comment || isCommentSending || isUpdatingComment}
          onPress={async () => {
            if (!commentToUpdate) {
              postComment({ body: { comment, authorId: `${user?.id}` }, id: activityId })
                .then(() => {
                  dispatch(setActivityIdWhichCommentsToUpdate(activityId));
                  setIsShowingTextInput(false);
                  setIdOfUpdatingComment('');
                  setComment('');
                })
                .catch(() => toast.show(COMMENT_INPUT[language].errorSending));
            } else {
              if (comment !== commentToUpdate) {
                await updateComment({ activityId, commentId, body: { comment } }).unwrap();
              } else {
                setIsShowingTextInput(false);
                setIdOfUpdatingComment('');
              }
            }
          }}
        />
      }
      onSubmitEditing={async () => {
        if (comment) {
          if (!commentToUpdate) {
            postComment({ body: { comment, authorId: `${user?.id}` }, id: activityId })
              .then(() => {
                dispatch(setActivityIdWhichCommentsToUpdate(activityId));
                setIsShowingTextInput(false);
                setIdOfUpdatingComment('');
                setComment('');
              })
              .catch(() => toast.show(COMMENT_INPUT[language].errorSending));
          } else {
            if (comment !== commentToUpdate) {
              await updateComment({ activityId, commentId, body: { comment } }).unwrap();
            } else {
              setIsShowingTextInput(false);
              setIdOfUpdatingComment('');
            }
          }
        }
      }}
      label={COMMENT_INPUT[language].label}
      autoFocus={!commentToUpdate || !!idOfUpdatingComment}
      enterKeyHint="send"
    />
  );
}
