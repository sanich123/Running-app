import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { useTheme } from 'react-native-paper';
import Comments from '@C/comment-page/comments/comments';
import { View } from 'react-native';
import CommentInput from '@C/comment-page/comment-input/comment-input';
import { backdrop } from '@U/backdrop';
import { useAppSelector } from '@R/typed-hooks';
import { CommentModalProps } from '../types';
import CommentAddBtn from '../comment-add-btn/comment-add-btn';

export default function CommentsListModal({ commentsModalRef }: CommentModalProps) {
  const { colors } = useTheme();
  const { activityOwnerProfile, isShowingTextInput, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const renderBackdrop = useCallback(backdrop, []);
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
