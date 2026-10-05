import { useCallback } from 'react';
import { BottomSheetFooter, BottomSheetModal, type BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { setCommentToUpdate, setIdOfUpdatingComment } from '@R/slices/comment/comment';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import CommentInput from '@S/comments/comment-input/comment-input';
import Comments from '@S/comments/comments/comments';
import { backdrop } from '@U/backdrop';
import type { CommentsListModalProps } from '../types';

export default function CommentsListModal({ commentsModalRef, allowNewComments = true }: CommentsListModalProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { activityOwnerProfile, commentToUpdate, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const { language } = useAppSelector(({ settings }) => settings);
  const renderBackdrop = useCallback((props: any) => backdrop(props), []);
  const clearCommentEditing = useCallback(() => {
    dispatch(setCommentToUpdate(''));
    dispatch(setIdOfUpdatingComment(''));
  }, [dispatch]);
  const renderFooter = useCallback(
    ({ animatedFooterPosition }: BottomSheetFooterProps) => (
      <BottomSheetFooter animatedFooterPosition={animatedFooterPosition} bottomInset={bottomInset}>
        <KeyboardStickyView
          testID="comments-composer-keyboard-sticky"
          offset={{ opened: -8 }}
          style={styles.stickyComposer}>
          <View
            testID="comments-composer"
            style={[
              styles.composer,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.outlineVariant,
              },
            ]}>
            {allowNewComments || idOfUpdatingComment ? (
              <CommentInput
                key={idOfUpdatingComment || 'new-comment'}
                profile={activityOwnerProfile}
                commentId={idOfUpdatingComment}
                commentToUpdate={commentToUpdate}
              />
            ) : (
              <Text variant="bodySmall" style={[styles.disabledNotice, { color: colors.onSurfaceVariant }]}>
                {language === LANGUAGES.russian
                  ? 'Владелец активности отключил лайки и новые комментарии.'
                  : 'The activity owner has disabled likes and new comments.'}
              </Text>
            )}
          </View>
        </KeyboardStickyView>
      </BottomSheetFooter>
    ),
    [
      activityOwnerProfile,
      allowNewComments,
      bottomInset,
      colors.onSurfaceVariant,
      colors.outlineVariant,
      colors.surface,
      commentToUpdate,
      idOfUpdatingComment,
      language,
    ],
  );

  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={1}
      snapPoints={['50%', '100%']}
      enableDynamicSizing={false}
      topInset={topInset}
      style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
      backdropComponent={renderBackdrop}
      onDismiss={clearCommentEditing}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      keyboardBlurBehavior="restore"
      keyboardBehavior="extend"
      android_keyboardInputMode="adjustResize"
      footerComponent={renderFooter}>
      <View style={styles.commentsContainer}>
        <Comments commentsModalRef={commentsModalRef} />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  commentsContainer: {
    flex: 1,
  },
  composer: {
    borderTopWidth: 1,
    paddingBottom: 8,
  },
  stickyComposer: {
    width: '100%',
  },
  disabledNotice: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlign: 'center',
  },
});
