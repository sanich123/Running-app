import { useEffect, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useGetCommentsByActivityIdQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import Comment from '../comment/comment';
import CommentsEmptyList from '../comments-empty/comments-empty';
import CommentsLoadMoreBtn from '../comments-load-more-btn/comments-load-more';
import type { CommentModalProps } from '../types';
import type { CommentResponse } from '@R/runich-api/types';

export default function Comments({ commentsModalRef }: CommentModalProps) {
  const { isShowingTextInput, commentActivityId } = useAppSelector(({ comment }) => comment);
  const isNeedToGetUpdatedComments = true;
  const [take, increaseTakeNumber] = useState(10);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const shouldGetUpdatedComments = isNeedToGetUpdatedComments || activityIdWhichCommentsToUpdate === commentActivityId;
  const { isLoading, error, isSuccess, isError, data, refetch } = useGetCommentsByActivityIdQuery(
    { activityId: commentActivityId, take },
    { skip: !shouldGetUpdatedComments },
  );
  const comments = useMemo(() => data?.comments ?? [], [data?.comments]);

  useEffect(() => {
    if (Platform.OS !== 'web' && !process.env.IS_TESTING) {
      if (!comments.length) {
        commentsModalRef.current?.snapToIndex(1);
      }
      if (comments.length === 1) {
        commentsModalRef.current?.snapToIndex(1);
      }
      if (comments.length === 2) {
        commentsModalRef.current?.snapToIndex(2);
      }
      if (comments.length === 3) {
        commentsModalRef.current?.snapToIndex(3);
      }
      if (comments.length > 3) {
        commentsModalRef.current?.snapToIndex(4);
      }
    }
  }, [comments, commentsModalRef]);

  return (
    <View>
      {isLoading ? (
        <ActivityIndicator testID="commentsActivityIndicator" size="large" />
      ) : isSuccess ? (
        <>
          {comments.length >= 10 && take < (data?.allCommentsLength ?? 0) && (
            <CommentsLoadMoreBtn
              take={take}
              increaseTakeNumber={increaseTakeNumber}
              commentsLength={data?.allCommentsLength}
            />
          )}
          {comments.length > 0 &&
            comments
              .slice()
              .sort((a: CommentResponse, b: CommentResponse) => Date.parse(a.date) - Date.parse(b.date))
              .map((comment) => <Comment {...comment} key={comment.id} commentsModalRef={commentsModalRef} />)}

          {!comments.length && !isShowingTextInput && <CommentsEmptyList />}
        </>
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </View>
  );
}
