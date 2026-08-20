import { useState } from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ActivityIndicator, Keyboard, Platform, View, StyleSheet } from 'react-native';
import { Button, Icon, IconButton, Text, TextInput as PaperTextInput, useTheme } from 'react-native-paper';
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

export default function CommentInput({
  commentToUpdate = '',
  commentId = '',
  profile,
  commentsModalRef,
}: CommentInputProps) {
  const [focused, setFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(52);
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { commentActivityId, mapPhotoUrl } = useAppSelector(({ comment }) => comment);
  const {
    profileFromServer: { profilePhoto, name, surname },
  } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ settings }) => settings);
  const [comment, setComment] = useState(commentToUpdate);
  const [sendEmailAfterSendingComment] = useSendEmailAfterSendingCommentMutation();
  const [postComment, { isLoading: isCommentSending }] = usePostCommentWithActivityIdMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentByCommentIdMutation();
  const isSending = isCommentSending || isUpdatingComment;
  const isEditing = Boolean(commentToUpdate);
  const shouldUseBottomSheetInput = Platform.OS !== 'web' && Boolean(commentsModalRef);

  function closeInput() {
    Keyboard.dismiss();
    dispatch(setIsShowingTextInput(false));
    dispatch(setIdOfUpdatingComment(''));
  }

  async function submitComment() {
    const normalizedComment = comment.trim();
    if (!normalizedComment || isSending) return;

    if (!commentToUpdate) {
      await sendingComment(normalizedComment);
    } else if (normalizedComment !== commentToUpdate.trim()) {
      await updatingComment(normalizedComment);
    }
  }

  async function sendingComment(normalizedComment: string) {
    return await postComment({ body: { comment: normalizedComment }, id: commentActivityId })
      .unwrap()
      .then(() => sendingUpdatingCommentSuccessHandler(normalizedComment))
      .catch((error) => errorToast('', error));
  }

  async function updatingComment(normalizedComment: string) {
    return await updateComment({ activityId: commentActivityId, commentId, body: { comment: normalizedComment } })
      .unwrap()
      .then(() => sendingUpdatingCommentSuccessHandler(normalizedComment))
      .catch((error) => errorToast('', error));
  }

  async function sendingUpdatingCommentSuccessHandler(sentComment = comment) {
    dispatch(setActivityIdWhichCommentsToUpdate(commentActivityId));
    closeInput();
    setComment('');
    if (profile.emailNotifications && profile.users?.email && !commentToUpdate) {
      const objectToSend = {
        name: name ?? '',
        surname: surname ?? '',
        profilePhoto: profilePhoto ?? '',
        comment: sentComment,
        recepientName: profile.name ?? '',
        recepientSurname: profile.surname ?? '',
        recepientEmail: profile.users.email,
        mapPhotoUrl: mapPhotoUrl ? mapPhotoUrl : '',
      };
      sendEmailAfterSendingComment(objectToSend);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text variant="labelLarge">
          {isEditing ? COMMENT_INPUT[language].editingLabel : COMMENT_INPUT[language].label}
        </Text>
        <Button compact mode="text" onPress={closeInput} testID="comment-input-cancel">
          {COMMENT_INPUT[language].cancel}
        </Button>
      </View>
      <View style={styles.inputRow}>
        {!shouldUseBottomSheetInput ? (
          <PaperTextInput
            testID={COMMENT_INPUT_TEST_ID}
            mode="outlined"
            placeholder={COMMENT_INPUT[language].placeholder}
            value={comment}
            style={[styles.paperInput, { backgroundColor: colors.surface, height: inputHeight }]}
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
            autoFocus
            multiline
            onContentSizeChange={({ nativeEvent }) =>
              setInputHeight(Math.min(Math.max(nativeEvent.contentSize.height, 52), 120))
            }
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
                  height: inputHeight,
                },
              ]}
              autoFocus
              multiline
              onChangeText={setComment}
              onSubmitEditing={submitComment}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onContentSizeChange={({ nativeEvent }) =>
                setInputHeight(Math.min(Math.max(nativeEvent.contentSize.height, 52), 120))
              }
              enterKeyHint="send"
            />
            <View style={styles.inputIcon}>
              <Icon source="comment-outline" size={20} color={colors.primary} />
            </View>
          </>
        )}
        {isSending ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : comment.trim().length > 0 ? (
          <IconButton
            testID={COMMENT_ICON_TEST_ID}
            icon="send"
            iconColor={colors.primary}
            mode="contained-tonal"
            containerColor={colors.primaryContainer}
            style={styles.sendButton}
            onPress={submitComment}
            disabled={isSending}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  inputRow: {
    minHeight: 52,
    paddingBottom: 10,
    position: 'relative',
  },
  paperInput: {
    fontSize: 15,
    minHeight: 52,
    width: '100%',
  },
  nativeInput: {
    borderRadius: 8,
    fontSize: 16,
    minHeight: 52,
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
  loadingButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 6,
    width: 40,
  },
});
