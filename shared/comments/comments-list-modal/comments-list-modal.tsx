import { useCallback, useState } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
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
  const [isCommentsResolved, setIsCommentsResolved] = useState(false);
  const renderBackdrop = useCallback((props: any) => backdrop(props), []);
  const handleCommentsViewStateChange = useCallback((state: CommentsViewState) => {
    if (state !== 'loading') {
      setCommentsViewState(state);
      setIsCommentsResolved(true);
    }
  }, []);
  const isComposerOpen = isShowingTextInput && !idOfUpdatingComment;

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
      android_keyboardInputMode="adjustPan">
      <View style={styles.commentsContainer}>
        <Comments
          commentsModalRef={commentsModalRef}
          onViewStateChange={handleCommentsViewStateChange}
          isBottomSheet
          contentContainerStyle={styles.commentsContent}
        />
        {!isCommentsResolved && commentsViewState === 'empty' && !isShowingTextInput && (
          <View pointerEvents="none" style={styles.emptyStateOverlay}>
            <CommentsEmptyList />
          </View>
        )}
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
          {isComposerOpen ? <CommentInput profile={activityOwnerProfile} commentId="" /> : <CommentAddBtn />}
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  commentsContainer: {
    flex: 1,
  },
  emptyStateOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  commentsContent: {
    paddingBottom: 8,
  },
  composer: {
    borderTopWidth: 1,
  },
});
