import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { RefObject, useState } from 'react';
import { ActivityIndicator, FAB, useTheme } from 'react-native-paper';
import Comments from '@C/comment-page/comments/comments';
import { useGetCommentsByActivityIdQuery } from '@R/runich-api/runich-api';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import ErrorComponent from '@C/error-component/error-component';
import CommentInput from '@C/comment-page/comment-input/comment-input';
import CommentsLoadMoreBtn from '@C/comment-page/comments/comments-load-more';
import CommentsEmptyList from '@C/comment-page/comments/comments-empty';

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
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(true);
  const [take, increaseTakeNumber] = useState(10);
  const { isLoading, error, isSuccess, isError, data, refetch } = useGetCommentsByActivityIdQuery(
    { activityId, take },
    { skip: !isNeedToGetUpdatedComments },
  );
  const { height } = useWindowDimensions();
  return (
    <BottomSheetModal
      ref={commentsModalRef}
      index={2}
      snapPoints={['20%', '40%', '60%', '80%']}
      backgroundStyle={{ backgroundColor: colors.secondaryContainer }}
      handleIndicatorStyle={{ backgroundColor: colors.onBackground }}>
      <View style={{ paddingHorizontal: 10 }}>
        {isShowingTextInput && !idOfUpdatingComment ? (
          <CommentInput
            activityId={`${activityId}`}
            setIsShowingTextInput={setIsShowingTextInput}
            commentId=""
            setIdOfUpdatingComment={setIdOfUpdatingComment}
          />
        ) : (
          <FAB
            testID="floatingBtn"
            icon="pencil"
            style={{ position: 'absolute', right: 20, top: 0, zIndex: 10 }}
            onPress={() => {
              setIdOfUpdatingComment('');
              setIsShowingTextInput(true);
            }}
          />
        )}
      </View>
      <BottomSheetScrollView
        contentContainerStyle={[
          (isLoading || isError || !!data?.comments?.message || !data?.comments?.length) && {
            ...styles.isInCenter,
            paddingTop: 0.2 * height,
          },
        ]}>
        {isLoading && <ActivityIndicator testID="commentsActivityIndicator" size="large" />}
        {isError || data?.comments?.message ? (
          <ErrorComponent error={error || data?.comments} refetch={refetch} />
        ) : null}
        {isSuccess && (
          <>
            {data?.comments?.length >= 10 && take < data?.allCommentsLength && (
              <CommentsLoadMoreBtn
                take={take}
                increaseTakeNumber={increaseTakeNumber}
                commentsLength={data?.allCommentsLength}
              />
            )}
            {!data?.comments?.length && !isShowingTextInput && <CommentsEmptyList />}
            {data?.comments?.length > 0 && (
              <Comments
                activityId={`${activityId}`}
                setIsNeedToGetUpdatedComments={setIsNeedToGetUpdatedComments}
                setIsShowingTextInput={setIsShowingTextInput}
                idOfUpdatingComment={idOfUpdatingComment}
                setIdOfUpdatingComment={setIdOfUpdatingComment}
                comments={data?.comments}
              />
            )}
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    flex: 1,
    position: 'relative',
  },
  commentWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  textCommentWrapper: {
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 10,
  },
  likesWrapper: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 15,
  },
  dateTimeWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  floatingBtn: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: -60,
    zIndex: 10,
  },
});
