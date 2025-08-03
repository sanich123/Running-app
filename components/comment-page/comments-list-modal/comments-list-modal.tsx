import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo } from 'react';
import { FAB, useTheme } from 'react-native-paper';
import Comments from '@C/comment-page/comments/comments';
import { Platform, View } from 'react-native';
import CommentInput from '@C/comment-page/comment-input/comment-input';
import { backdrop } from '@U/backdrop';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { CommentModalProps } from '../types';

export default function CommentsListModal({ commentsModalRef }: CommentModalProps) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { activityOwnerProfile, isShowingTextInput, idOfUpdatingComment } = useAppSelector(({ comment }) => comment);
  const renderBackdrop = useCallback(backdrop, []);
  const snapPoints = useMemo(() => ['22%', '35%', '55%', '60%', '70%', '90%'], []);

  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={3}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}
      keyboardBehavior="interactive">
      <BottomSheetScrollView>
        <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
          {isShowingTextInput && !idOfUpdatingComment ? (
            <CommentInput profile={activityOwnerProfile} commentsModalRef={commentsModalRef} commentId="" />
          ) : (
            <View style={{ position: 'absolute', right: 10, top: Platform.OS === 'ios' ? 2 : 0, zIndex: 100 }}>
              <FAB
                testID="floatingBtn"
                icon="pencil"
                onPress={() => {
                  dispatch(setIdOfUpdatingComment(''));
                  dispatch(setIsShowingTextInput(true));
                  commentsModalRef.current?.present();
                }}
              />
            </View>
          )}
        </View>
        <Comments commentsModalRef={commentsModalRef} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
