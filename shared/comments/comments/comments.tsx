import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useGetCommentsByActivityIdQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import Comment from '../comment/comment';
import CommentsEmptyList from '../comments-empty/comments-empty';
import CommentsLoadMoreBtn from '../comments-load-more-btn/comments-load-more';
import type { CommentsProps } from '../types';
import type { CommentResponse } from '@R/runich-api/types';

export default function Comments({ commentsModalRef, onViewStateChange, showEmptyState = true }: CommentsProps) {
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
    if (isLoading) {
      onViewStateChange?.('loading');
    } else if (isSuccess) {
      onViewStateChange?.(comments.length ? 'loaded' : 'empty');
    } else if (isError) {
      onViewStateChange?.('error');
    }
  }, [comments.length, isError, isLoading, isSuccess, onViewStateChange]);

  return (
    <View>
      {isLoading ? null : isSuccess ? (
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

          {showEmptyState && !comments.length && (!isShowingTextInput || onViewStateChange) && <CommentsEmptyList />}
        </>
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </View>
  );
}
