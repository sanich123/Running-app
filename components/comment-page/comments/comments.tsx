import { CommentLikeResponse, CommentResponse } from '@R/runich-api/types';
import { useAppSelector } from '@R/typed-hooks';
import { RefObject, useEffect, useState } from 'react';

import Comment from '../comment/comment';
import { useGetCommentsByActivityIdQuery } from '@R/runich-api/runich-api';
import { ActivityIndicator } from 'react-native-paper';
import ErrorComponent from '@C/error-component/error-component';
import CommentsLoadMoreBtn from './comments-load-more';
import CommentsEmptyList from './comments-empty';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { View } from 'react-native';

export default function Comments({
  activityId,
  idOfUpdatingComment,
  setIdOfUpdatingComment,
  commentsModalRef,
  setIsShowingTextInput,
  isShowingTextInput,
}: {
  activityId: string;
  idOfUpdatingComment: string;
  setIdOfUpdatingComment: (arg: string) => void;
  commentsModalRef: RefObject<BottomSheetModal>;
  setIsShowingTextInput: (arg: boolean) => void;
  isShowingTextInput: boolean;
}) {
  const [isNeedToGetUpdatedComments, setIsNeedToGetUpdatedComments] = useState(true);
  const [take, increaseTakeNumber] = useState(10);
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const { isLoading, error, isSuccess, isError, data, refetch } = useGetCommentsByActivityIdQuery(
    { activityId, take },
    { skip: !isNeedToGetUpdatedComments },
  );
  useEffect(() => {
    if (activityIdWhichCommentsToUpdate === activityId) {
      setIsNeedToGetUpdatedComments(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityIdWhichCommentsToUpdate, activityId]);

  useEffect(() => {
    if (!data?.comments || !data?.comments?.length) {
      commentsModalRef.current?.snapToIndex(0);
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
  }, [data, commentsModalRef]);

  return (
    <View>
      {isLoading && <ActivityIndicator testID="commentsActivityIndicator" size="large" />}
      {isError || data?.comments?.message ? <ErrorComponent error={error || data?.comments} refetch={refetch} /> : null}
      {isSuccess && (
        <>
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
                  activityId={activityId}
                  idOfUpdatingComment={idOfUpdatingComment}
                  setIdOfUpdatingComment={setIdOfUpdatingComment}
                  setIsShowingTextInput={setIsShowingTextInput}
                  commentLike={commentLike}
                />
              ))}
          {data?.comments?.length >= 10 && take < data?.allCommentsLength && (
            <CommentsLoadMoreBtn
              take={take}
              increaseTakeNumber={increaseTakeNumber}
              commentsLength={data?.allCommentsLength}
            />
          )}
          {!data?.comments?.length && !isShowingTextInput && <CommentsEmptyList />}
        </>
      )}
    </View>
  );
}
