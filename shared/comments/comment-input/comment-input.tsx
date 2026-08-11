import { useState } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Platform, StyleSheet, View } from 'react-native';
import { Icon, IconButton, TextInput as PaperTextInput, useTheme } from 'react-native-paper';
import {
  usePostCommentWithActivityIdMutation,
  useUpdateCommentByCommentIdMutation,
} from '@R/services/comments/comments';
import { useSendEmailAfterSendingCommentMutation } from '@R/services/emails/emails';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { setActivityIdWhichCommentsToUpdate } from '@R/slices/main-feed/main-feed';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { COMMENT_ICON_TEST_ID, COMMENT_INPUT, COMMENT_INPUT_TEST_ID } from './const';
import type { CommentInputProps } from '../types';

export default function CommentInput({ commentToUpdate = '', commentId = '', profile }: CommentInputProps) {
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { commentActivityId, mapPhotoUrl } = useAppSelector(({ comment }) => comment);
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const [comment, setComment] = useState(commentToUpdate);
  const [sendEmailAfterSendingComment] = useSendEmailAfterSendingCommentMutation();
  const [postComment, { isLoading: isCommentSending }] = usePostCommentWithActivityIdMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentByCommentIdMutation();

  async function submitComment() {
    if (!comment) return;

    if (!commentToUpdate) {
      await sendingComment();
    } else if (comment !== commentToUpdate) {
      await updatingComment();
    }
  }

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
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        {Platform.OS === 'web' ? (
          <PaperTextInput
            testID={COMMENT_INPUT_TEST_ID}
            mode="outlined"
            placeholder={COMMENT_INPUT[language].placeholder}
            value={comment}
            style={[styles.paperInput, { backgroundColor: colors.surface }]}
            contentStyle={styles.content}
            outlineStyle={styles.outline}
            outlineColor={colors.outlineVariant}
            activeOutlineColor={colors.primary}
            textColor={colors.onSurface}
            left={<PaperTextInput.Icon icon="comment-outline" color={colors.primary} />}
            onChangeText={setComment}
            onSubmitEditing={submitComment}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            enterKeyHint="send"
          />
        ) : (
          <>
            <BottomSheetTextInput
              testID={COMMENT_INPUT_TEST_ID}
              placeholder={COMMENT_INPUT[language].placeholder}
              value={comment}
              style={[
                styles.nativeInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderWidth: focused ? 2 : 1,
                  color: colors.onSurface,
                },
              ]}
              onChangeText={setComment}
              onSubmitEditing={submitComment}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              enterKeyHint="send"
            />
            <View style={styles.inputIcon}>
              <Icon source="comment-outline" size={20} color={colors.primary} />
            </View>
          </>
        )}
        {comment.length > 0 ? (
          <IconButton
            testID={COMMENT_ICON_TEST_ID}
            icon="send"
            iconColor={colors.primary}
            mode="contained-tonal"
            containerColor={colors.primaryContainer}
            style={styles.sendButton}
            onPress={submitComment}
            disabled={isCommentSending || isUpdatingComment}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
  inputRow: {
    minHeight: 52,
    position: 'relative',
  },
  paperInput: {
    fontSize: 15,
    height: 52,
    width: '100%',
  },
  nativeInput: {
    borderRadius: 8,
    fontSize: 16,
    height: 52,
    paddingLeft: 44,
    paddingRight: 50,
    paddingVertical: 13,
    textAlignVertical: 'center',
    width: '100%',
  },
  content: {
    paddingRight: 42,
  },
  outline: {
    borderRadius: 8,
  },
  inputIcon: {
    left: 12,
    position: 'absolute',
    top: 16,
  },
  sendButton: {
    height: 40,
    margin: 0,
    position: 'absolute',
    right: 4,
    top: 6,
    width: 40,
  },
});
