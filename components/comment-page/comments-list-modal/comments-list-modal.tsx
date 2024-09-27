import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useState } from 'react';
import { FAB, useTheme } from 'react-native-paper';
import Comments from '@C/comment-page/comments/comments';
import { View } from 'react-native';
import CommentInput from '@C/comment-page/comment-input/comment-input';
import { CommentsListModalProps } from '../types';

export default function CommentsListModal({ commentsModalRef, activityId }: CommentsListModalProps) {
  const { colors } = useTheme();
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const [idOfUpdatingComment, setIdOfUpdatingComment] = useState('');
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  const snapPoints = useMemo(() => ['20%', '25%', '55%', '65%', '90%'], []);

  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.onSecondary, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.onSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <View style={{ paddingHorizontal: 10, marginBottom: 5 }}>
        {isShowingTextInput && !idOfUpdatingComment ? (
          <CommentInput
            idOfUpdatingComment={idOfUpdatingComment}
            activityId={`${activityId}`}
            setIsShowingTextInput={setIsShowingTextInput}
            commentId=""
            setIdOfUpdatingComment={setIdOfUpdatingComment}
          />
        ) : (
          <FAB
            testID="floatingBtn"
            icon="pencil"
            style={{ position: 'absolute', right: 10, top: 0, zIndex: 10 }}
            onPress={() => {
              commentsModalRef.current?.snapToIndex(2);
              setIdOfUpdatingComment('');
              setIsShowingTextInput(true);
            }}
          />
        )}
      </View>
      <BottomSheetScrollView>
        <Comments
          isShowingTextInput={isShowingTextInput}
          setIsShowingTextInput={setIsShowingTextInput}
          activityId={activityId}
          idOfUpdatingComment={idOfUpdatingComment}
          setIdOfUpdatingComment={setIdOfUpdatingComment}
          commentsModalRef={commentsModalRef}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
