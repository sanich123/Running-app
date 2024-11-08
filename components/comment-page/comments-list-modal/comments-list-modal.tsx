import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useState } from 'react';
import { FAB, useTheme } from 'react-native-paper';
import Comments from '@C/comment-page/comments/comments';
import { Platform, View } from 'react-native';
import CommentInput from '@C/comment-page/comment-input/comment-input';
import { CommentsListModalProps } from '../types';
import { backdrop } from '@U/backdrop';

export default function CommentsListModal({
  commentsModalRef,
  activityId,
  profile,
  mapPhotoUrl,
}: CommentsListModalProps) {
  const { colors } = useTheme();
  const [isShowingTextInput, setIsShowingTextInput] = useState(false);
  const [idOfUpdatingComment, setIdOfUpdatingComment] = useState('');
  const renderBackdrop = useCallback(backdrop, []);
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
      <View style={{ paddingHorizontal: 10, marginBottom: 5, zIndex: 7 }}>
        {isShowingTextInput && !idOfUpdatingComment ? (
          <CommentInput
            profile={profile}
            idOfUpdatingComment={idOfUpdatingComment}
            activityId={`${activityId}`}
            setIsShowingTextInput={setIsShowingTextInput}
            commentId=""
            mapPhotoUrl={mapPhotoUrl}
            setIdOfUpdatingComment={setIdOfUpdatingComment}
          />
        ) : (
          <View>
            <FAB
              testID="floatingBtn"
              icon="pencil"
              style={{ position: 'absolute', right: 10, top: Platform.OS === 'ios' ? 2 : 0, zIndex: 10 }}
              onPress={() => {
                commentsModalRef.current?.snapToIndex(2);
                setIdOfUpdatingComment('');
                setIsShowingTextInput(true);
              }}
            />
          </View>
        )}
      </View>
      <BottomSheetScrollView>
        <Comments
          isShowingTextInput={isShowingTextInput}
          setIsShowingTextInput={setIsShowingTextInput}
          activityId={activityId}
          mapPhotoUrl={mapPhotoUrl}
          idOfUpdatingComment={idOfUpdatingComment}
          setIdOfUpdatingComment={setIdOfUpdatingComment}
          commentsModalRef={commentsModalRef}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
