import { useCallback, useState } from 'react';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
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
  const { top: topInset } = useSafeAreaInsets();
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
      android_keyboardInputMode="adjustResize">
      <BottomSheetScrollView>
        <Comments
          commentsModalRef={commentsModalRef}
          onViewStateChange={handleCommentsViewStateChange}
          showEmptyState={false}
        />
        {commentsViewState === 'empty' && !isShowingTextInput && <CommentsEmptyList />}
        {commentsViewState !== 'loading' && (
          <View style={{ paddingHorizontal: 10, marginBottom: 5, paddingBottom: 150 }}>
            {commentsViewState === 'empty' && !isShowingTextInput ? (
              <CommentAddBtn />
            ) : isShowingTextInput && !idOfUpdatingComment ? (
              <CommentInput profile={activityOwnerProfile} commentsModalRef={commentsModalRef} commentId="" />
            ) : (
              <CommentAddBtn />
            )}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
