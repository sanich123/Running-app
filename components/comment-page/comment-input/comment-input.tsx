import { useAuth } from '@A/context/auth-context';
import { setActivityIdWhichCommentsToUpdate } from '@R/main-feed/main-feed';
import {
  usePostCommentWithActivityIdMutation,
  useSendEmailAfterSendingCommentMutation,
  useUpdateCommentByCommentIdMutation,
} from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useState } from 'react';
import { Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { COMMENT_ICON_TEST_ID, COMMENT_INPUT, COMMENT_INPUT_TEST_ID } from './const';
import { CommentInputProps } from '../types';

export default function CommentInput({
  commentToUpdate = '',
  activityId,
  profile,
  setIsShowingTextInput,
  commentId = '',
  setIdOfUpdatingComment,
  idOfUpdatingComment,
  mapPhotoUrl,
}: CommentInputProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();
  const [comment, setComment] = useState(commentToUpdate);
  const [sendEmailAfterSendingComment] = useSendEmailAfterSendingCommentMutation();
  const [postComment, { isLoading: isCommentSending }] = usePostCommentWithActivityIdMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentByCommentIdMutation();

  async function sendingComment() {
    return await postComment({ body: { comment, authorId: `${user?.id}` }, id: activityId })
      .then(() => sendingUpdatingCommentSuccessHandler())
      .catch((error) => {
        console.log(error);
        sendingUpdatingCommentErrorHandler();
      });
  }

  async function updatingComment() {
    return await updateComment({ activityId, commentId, body: { comment } })
      .then(sendingUpdatingCommentSuccessHandler)
      .catch(sendingUpdatingCommentErrorHandler);
  }

  async function sendingUpdatingCommentSuccessHandler() {
    dispatch(setActivityIdWhichCommentsToUpdate(activityId));
    setIsShowingTextInput(false);
    setIdOfUpdatingComment('');
    setComment('');
    if (profile.emailNotifications && !commentToUpdate) {
      const objectToSend = {
        name,
        surname,
        profilePhoto,
        comment,
        recepientName: profile?.name,
        recepientSurname: profile?.surname,
        recepientEmail: profile?.users?.email,
        mapPhotoUrl: mapPhotoUrl ? mapPhotoUrl : '',
      };
      sendEmailAfterSendingComment(objectToSend);
    }
  }

  function sendingUpdatingCommentErrorHandler() {
    if (Platform.OS !== 'web') {
      showCrossPlatformToast(COMMENT_INPUT[language].errorSending);
    } else {
      toast.show(COMMENT_INPUT[language].errorSending);
    }
  }

  return (
    <TextInput
      testID={COMMENT_INPUT_TEST_ID}
      mode="outlined"
      placeholder={COMMENT_INPUT[language].placeholder}
      value={comment}
      onChangeText={(comment) => setComment(comment)}
      disabled={isCommentSending || isUpdatingComment}
      right={
        <TextInput.Icon
          testID={COMMENT_ICON_TEST_ID}
          icon="pencil"
          disabled={!comment || isCommentSending || isUpdatingComment}
          onPress={async () => {
            if (comment) {
              if (!commentToUpdate) {
                await sendingComment();
              } else {
                if (comment !== commentToUpdate) {
                  await updatingComment();
                }
              }
            }
          }}
        />
      }
      onSubmitEditing={async () => {
        if (comment) {
          if (!commentToUpdate) {
            return await sendingComment();
          } else {
            if (comment !== commentToUpdate) {
              await updatingComment();
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
