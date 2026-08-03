import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import ErrorComponent from '@C/error-component/error-component';
import { useGetCommentsByActivityIdQuery } from '@R/services/comments/comments';
import { useAppSelector } from '@R/typed-hooks';
import Comment from '../comment/comment';
import CommentsEmptyList from '../comments-empty/comments-empty';
import CommentsLoadMoreBtn from '../comments-load-more-btn/comments-load-more';
import type { CommentModalProps } from '../types';
import type { CommentLikeResponse, CommentResponse } from '@R/runich-api/types';

export default function Comments({ commentsModalRef }: CommentModalProps) {
  const { isShowingTextInput, commentActivityId } = useAppSelector(({ comment }) => comment);
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(true);
  const [take, increaseTakeNumber] = useState(10);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const { isLoading, error, isSuccess, isError, data, refetch } = useGetCommentsByActivityIdQuery(
    { activityId: commentActivityId, take },
    { skip: !isNeedToGetUpdatedComments },
  );

  useEffect(() => {
    if (activityIdWhichCommentsToUpdate === commentActivityId) {
      setIsNeedToGetUpdatedComments(true);
    }
  }, [activityIdWhichCommentsToUpdate, commentActivityId]);

  useEffect(() => {
    if (Platform.OS !== 'web' && !process.env.IS_TESTING) {
      if (!data?.comments || !data?.comments?.length) {
        commentsModalRef.current?.snapToIndex(1);
      }
      if (data?.comments?.length === 1) {
        commentsModalRef.current?.snapToIndex(1);
      }
      if (data?.comments?.length === 2) {
        commentsModalRef.current?.snapToIndex(2);
      }
      if (data?.comments?.length === 3) {
        commentsModalRef.current?.snapToIndex(3);
      }
      if (data?.comments?.length > 3) {
        commentsModalRef.current?.snapToIndex(4);
      }
    }
  }, [data, commentsModalRef]);

  return (
    <View>
      {isLoading && <ActivityIndicator testID="commentsActivityIndicator" size="large" />}
      {isError ? <ErrorComponent error={error} refetch={refetch} /> : null}
      {isSuccess && (
        <>
          {data?.comments?.length >= 10 && take < data?.allCommentsLength && (
            <CommentsLoadMoreBtn
              take={take}
              increaseTakeNumber={increaseTakeNumber}
              commentsLength={data?.allCommentsLength}
            />
          )}
          {data?.comments?.length > 0 &&
            data?.comments
              ?.slice()
              ?.sort((a: CommentResponse, b: CommentResponse) => Date.parse(a.date) - Date.parse(b.date))
              .map(({ authorId, comment, id, date, profile, commentLike }: CommentResponse & CommentLikeResponse) => (
                <Comment
                  authorId={authorId}
                  comment={comment}
                  key={id}
                  id={id}
                  date={date}
                  profile={profile}
                  commentLike={commentLike}
                  commentsModalRef={commentsModalRef}
                />
              ))}

          {!data?.comments?.length && !isShowingTextInput && <CommentsEmptyList />}
        </>
      )}
    </View>
  );
}
