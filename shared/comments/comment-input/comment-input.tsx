import { useState } from 'react';
import { Keyboard, View, StyleSheet, Platform, Text as NativeText } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';
import {
  usePostCommentWithActivityIdMutation,
  useUpdateCommentByCommentIdMutation,
} from '@R/services/comments/comments';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { COMMENT_ICON_TEST_ID, COMMENT_INPUT, COMMENT_INPUT_TEST_ID, CommentTextInput } from './const';
import { getCommentInputHeight } from './utils';
import type { CommentInputProps } from '../types';

export default function CommentInput({ commentToUpdate = '', commentId = '' }: CommentInputProps) {
  const [focused, setFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(52);
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { commentActivityId } = useAppSelector(({ comment }) => comment);
  const { language } = useAppSelector(({ settings }) => settings);
  const [comment, setComment] = useState(commentToUpdate);
  const [postComment, { isLoading: isCommentSending }] = usePostCommentWithActivityIdMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentByCommentIdMutation();
  const isSending = isCommentSending || isUpdatingComment;
  const isEditing = Boolean(commentId && commentToUpdate);

  function closeInput() {
    Keyboard.dismiss();
    setComment('');
    dispatch(setCommentToUpdate(''));
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
      .then(closeInput)
      .catch((error) => errorToast('', error));
  }

  async function updatingComment(normalizedComment: string) {
    return await updateComment({ activityId: commentActivityId, commentId, body: { comment: normalizedComment } })
      .unwrap()
      .then(closeInput)
      .catch((error) => errorToast('', error));
  }

  return (
    <View style={styles.wrapper}>
      {isEditing ? (
        <View style={styles.header}>
          <Text variant="labelLarge">{COMMENT_INPUT[language].editingLabel}</Text>
        </View>
      ) : null}
      <View style={styles.inputRow}>
        <CommentTextInput
          testID={COMMENT_INPUT_TEST_ID}
          placeholder={COMMENT_INPUT[language].placeholder}
          placeholderTextColor={Platform.OS === 'ios' ? 'transparent' : undefined}
          value={comment}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              borderWidth: focused ? 2 : 1,
              color: colors.onSurface,
              height: inputHeight,
            },
          ]}
          multiline
          onChangeText={setComment}
          onSubmitEditing={submitComment}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
          }}
          onContentSizeChange={({ nativeEvent }) =>
            setInputHeight(getCommentInputHeight(nativeEvent.contentSize.height))
          }
          returnKeyType="send"
          submitBehavior="submit"
          enterKeyHint="send"
        />
        {Platform.OS === 'ios' && comment.length === 0 ? (
          <View pointerEvents="none" style={styles.placeholderContainer}>
            <NativeText style={[styles.placeholderText, { color: colors.onSurfaceDisabled }]}>
              {COMMENT_INPUT[language].placeholder}
            </NativeText>
          </View>
        ) : null}
        <View style={styles.inputIcon}>
          <Icon source="comment-outline" size={20} color={colors.primary} />
        </View>
        {comment.length > 0 ? (
          <IconButton
            testID="comment-input-cancel"
            icon="close"
            iconColor={colors.onSurfaceVariant}
            accessibilityLabel={COMMENT_INPUT[language].cancel}
            style={[styles.actionButton, comment.trim().length > 0 && styles.cancelButtonBesideSend]}
            onPress={closeInput}
          />
        ) : null}
        {comment.trim().length > 0 ? (
          <IconButton
            loading={isSending}
            testID={COMMENT_ICON_TEST_ID}
            icon="send"
            iconColor={colors.primary}
            mode="contained-tonal"
            containerColor={colors.primaryContainer}
            style={styles.actionButton}
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
  input: {
    borderRadius: 8,
    fontSize: 16,
    minHeight: 52,
    paddingLeft: 44,
    paddingRight: 96,
    paddingVertical: 0,
    paddingTop: Platform.OS === 'ios' ? 14 : 0,
    textAlignVertical: Platform.OS === 'ios' ? 'top' : 'center',
    width: '100%',
  },
  inputIcon: {
    left: 12,
    position: 'absolute',
    top: 16,
  },
  placeholderContainer: {
    bottom: 10,
    justifyContent: 'center',
    left: 44,
    position: 'absolute',
    right: 96,
    top: 0,
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 20,
  },
  actionButton: {
    height: 40,
    margin: 0,
    position: 'absolute',
    right: 4,
    top: 6,
    width: 40,
  },
  cancelButtonBesideSend: {
    right: 48,
  },
});
