import { useCallback } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import CommentInput from '@S/comments/comment-input/comment-input';
import Comments from '@S/comments/comments/comments';
import { backdrop } from '@U/backdrop';
import { COMMENT_KEYBOARD_OFFSET } from './const';
import type { CommentsListModalProps } from '../types';

export default function CommentsListModal({ commentsModalRef }: CommentsListModalProps) {
  const { colors } = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { activityOwnerProfile, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const renderBackdrop = useCallback((props: any) => backdrop(props), []);
  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={1}
      snapPoints={['50%', '100%']}
      enableDynamicSizing={false}
      topInset={topInset}
      style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      keyboardBlurBehavior="restore"
      keyboardBehavior="extend"
      android_keyboardInputMode="adjustResize">
      <View style={styles.commentsContainer}>
        <Comments commentsModalRef={commentsModalRef} />
        <KeyboardAvoidingView
          behavior="position"
          automaticOffset
          keyboardVerticalOffset={COMMENT_KEYBOARD_OFFSET}
          style={styles.keyboardAvoidingComposer}>
          <View
            testID="comments-composer"
            style={[
              styles.composer,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.outlineVariant,
                paddingBottom: bottomInset + 8,
              },
            ]}>
            {!idOfUpdatingComment && <CommentInput profile={activityOwnerProfile} commentId="" />}
          </View>
        </KeyboardAvoidingView>
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
  },
  keyboardAvoidingComposer: {
    width: '100%',
  },
});
