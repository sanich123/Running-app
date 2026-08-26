import { useCallback } from 'react';
import { BottomSheetFooter, BottomSheetModal, type BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import CommentInput from '@S/comments/comment-input/comment-input';
import Comments from '@S/comments/comments/comments';
import { backdrop } from '@U/backdrop';
import type { CommentsListModalProps } from '../types';

export default function CommentsListModal({ commentsModalRef }: CommentsListModalProps) {
  const { colors } = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { activityOwnerProfile, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const renderBackdrop = useCallback((props: any) => backdrop(props), []);
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
            {!idOfUpdatingComment && <CommentInput profile={activityOwnerProfile} commentId="" />}
          </View>
        </KeyboardStickyView>
      </BottomSheetFooter>
    ),
    [activityOwnerProfile, bottomInset, colors.outlineVariant, colors.surface, idOfUpdatingComment],
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
});
