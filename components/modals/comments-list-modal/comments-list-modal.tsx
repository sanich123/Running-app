import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { RefObject, useCallback, useState } from 'react';
import { FAB, useTheme } from 'react-native-paper';
import Comments from '@C/comment-page/comments/comments';
import { View } from 'react-native';
import CommentInput from '@C/comment-page/comment-input/comment-input';

export default function CommentsListModal({
  commentsModalRef,
  activityId,
}: {
  commentsModalRef: RefObject<BottomSheetModal>;
  activityId: string;
}) {
  const { colors } = useTheme();
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const [idOfUpdatingComment, setIdOfUpdatingComment] = useState('');
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={0} appearsOnIndex={1} />,
    [],
  );

  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={0}
      snapPoints={['20%', '25%', '55%', '65%', '90%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.secondaryContainer }}
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
