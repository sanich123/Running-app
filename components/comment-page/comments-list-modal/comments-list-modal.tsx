import { useCallback } from 'react';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import CommentInput from '@C/comment-page/comment-input/comment-input';
import Comments from '@C/comment-page/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import { backdrop } from '@U/backdrop';
import CommentAddBtn from '../comment-add-btn/comment-add-btn';
import type { CommentModalProps } from '../types';

export default function CommentsListModal({ commentsModalRef }: CommentModalProps) {
  const { colors } = useTheme();
  const { activityOwnerProfile, isShowingTextInput, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const renderBackdrop = useCallback((props: any) => backdrop(props), []);
  const snapPoints = ['20%', '50%', '55%', '60%'];

  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={2}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}
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
