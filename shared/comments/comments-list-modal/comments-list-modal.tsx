import { useCallback, useState } from 'react';
import { BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import CommentInput from '@S/comments/comment-input/comment-input';
import Comments from '@S/comments/comments/comments';
import CommentsEmptyList from '@S/comments/comments-empty/comments-empty';
import { backdrop } from '@U/backdrop';
import CommentAddBtn from '../comment-add-btn/comment-add-btn';
import type { CommentsListModalProps, CommentsViewState } from '../types';
import type { BottomSheetFooterProps } from '@gorhom/bottom-sheet';

export default function CommentsListModal({
  commentsModalRef,
  commentsLength: knownCommentsLength,
}: CommentsListModalProps) {
  const { colors } = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const { activityOwnerProfile, commentsLength, isShowingTextInput, idOfUpdatingComment } = useAppSelector(
    ({ comment }) => comment,
  );
  const expectedCommentsLength = knownCommentsLength ?? commentsLength;
  const initialCommentsViewState = (expectedCommentsLength > 0 ? 'loaded' : 'empty') as CommentsViewState;
  const [commentsViewState, setCommentsViewState] = useState<CommentsViewState>(initialCommentsViewState);
  const renderBackdrop = useCallback((props: any) => backdrop(props), []);
  const handleCommentsViewStateChange = useCallback((state: CommentsViewState) => {
    if (state !== 'loading') {
      setCommentsViewState(state);
    }
  }, []);
  const isComposerOpen = isShowingTextInput && !idOfUpdatingComment;
  const renderFooter = useCallback(
    ({ animatedFooterPosition }: BottomSheetFooterProps) => (
      <BottomSheetFooter animatedFooterPosition={animatedFooterPosition} bottomInset={bottomInset}>
        <View
          testID="comments-composer"
          style={[
            styles.composer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.outlineVariant,
            },
          ]}>
          {isComposerOpen ? (
            <CommentInput profile={activityOwnerProfile} commentsModalRef={commentsModalRef} commentId="" />
          ) : (
            <CommentAddBtn />
          )}
        </View>
      </BottomSheetFooter>
    ),
    [activityOwnerProfile, bottomInset, colors, commentsModalRef, isComposerOpen],
  );

  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={0}
      snapPoints={['50%', '100%']}
      enableDynamicSizing={false}
      topInset={topInset}
      style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      keyboardBlurBehavior="restore"
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
      footerComponent={commentsViewState !== 'loading' ? renderFooter : undefined}>
      <View style={styles.commentsContainer}>
        <Comments
          commentsModalRef={commentsModalRef}
          onViewStateChange={handleCommentsViewStateChange}
          showEmptyState={false}
          isBottomSheet
          contentContainerStyle={{ paddingBottom: isComposerOpen ? 190 : 100 }}
        />
        {commentsViewState === 'empty' && !isShowingTextInput && <CommentsEmptyList />}
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
});
