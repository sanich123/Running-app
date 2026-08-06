import { useCallback } from 'react';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import CommentInput from '@Routes/comment-page/comment-input/comment-input';
import Comments from '@Routes/comment-page/comments/comments';
import { backdrop } from '@U/backdrop';
import CommentAddBtn from '../comment-add-btn/comment-add-btn';
import type { CommentModalProps } from '../types';

export default function CommentsListModal({ commentsModalRef }: CommentModalProps) {
  const { colors } = useTheme();
  const { top: topInset } = useSafeAreaInsets();
  const { activityOwnerProfile, isShowingTextInput, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const renderBackdrop = useCallback((props: any) => backdrop(props), []);
  const snapPoints = ['20%', '50%', '55%', '60%'];

  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={2}
      snapPoints={snapPoints}
      topInset={topInset}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      keyboardBlurBehavior="restore"
      keyboardBehavior="extend">
      <BottomSheetScrollView>
        <Comments commentsModalRef={commentsModalRef} />
        <View style={{ paddingHorizontal: 10, marginBottom: 5, paddingBottom: 150 }}>
          {isShowingTextInput && !idOfUpdatingComment ? (
            <CommentInput profile={activityOwnerProfile} commentsModalRef={commentsModalRef} commentId="" />
          ) : (
            <CommentAddBtn />
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
