import { useState } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { errorToast } from '@C/shared/error-toast/error-toast';
import {
  usePostCommentWithActivityIdMutation,
  useUpdateCommentByCommentIdMutation,
} from '@R/services/comments/comments';
import { useSendEmailAfterSendingCommentMutation } from '@R/services/emails/emails';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { setActivityIdWhichCommentsToUpdate } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { COMMENT_ICON_TEST_ID, COMMENT_INPUT, COMMENT_INPUT_TEST_ID } from './const';
import type { CommentInputProps } from '../types';

export default function CommentInput({ commentToUpdate = '', commentId = '', profile }: CommentInputProps) {
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { commentActivityId, mapPhotoUrl, commentsLength } = useAppSelector(({ comment }) => comment);
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const [comment, setComment] = useState(commentToUpdate);
  const [sendEmailAfterSendingComment] = useSendEmailAfterSendingCommentMutation();
  const [postComment, { isLoading: isCommentSending }] = usePostCommentWithActivityIdMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentByCommentIdMutation();

  async function sendingComment() {
    return await postComment({ body: { comment, authorId: userId }, id: commentActivityId })
      .unwrap()
      .then(() => sendingUpdatingCommentSuccessHandler())
      .catch((error) => errorToast('', error));
  }

  async function updatingComment() {
    return await updateComment({ activityId: commentActivityId, commentId, body: { comment } })
      .unwrap()
      .then(sendingUpdatingCommentSuccessHandler)
      .catch((error) => errorToast('', error));
  }

  async function sendingUpdatingCommentSuccessHandler() {
    dispatch(setActivityIdWhichCommentsToUpdate(commentActivityId));
    dispatch(setIsShowingTextInput(false));
    dispatch(setIdOfUpdatingComment(''));
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

  return (
    <View style={{ padding: 10 }}>
      <BottomSheetTextInput
        testID={COMMENT_INPUT_TEST_ID}
        placeholder={COMMENT_INPUT[language].placeholder}
        value={comment}
        style={{
          paddingVertical: 13,
          paddingHorizontal: 10,
          borderRadius: 5,
          borderColor: colors.primary,
          borderWidth: focused ? 2 : 1,
          color: colors.onBackground,
          fontSize: 16,
        }}
        autoFocus={!commentsLength}
        onChangeText={(comment) => setComment(comment)}
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        enterKeyHint="send"
      />
      {comment && (
        <IconButton
          testID={COMMENT_ICON_TEST_ID}
          icon="send"
          iconColor={colors.primary}
          style={{ right: 5, position: 'absolute', top: 7 }}
          onPress={async () => {
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
          disabled={isCommentSending || isUpdatingComment}
        />
      )}
    </View>
  );
}
