import { CommentLikeResponse, CommentResponse } from '@R/runich-api/types';
import { useAppSelector } from '@R/typed-hooks';
import { useEffect } from 'react';

import Comment from '../comment/comment';

export default function Comments({
  activityId,
  setIsShowingTextInput,
  idOfUpdatingComment,
  setIdOfUpdatingComment,
  setIsNeedToGetUpdatedComments,
  comments,
}: {
  activityId: string;
  setIsShowingTextInput: (arg: boolean) => void;
  setIsNeedToGetUpdatedComments: (arg: boolean) => void;
  idOfUpdatingComment: string;
  setIdOfUpdatingComment: (arg: string) => void;
  comments: (CommentResponse & CommentLikeResponse)[];
}) {
  const { activityIdWhichCommentsToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);

  useEffect(() => {
    if (activityIdWhichCommentsToUpdate === activityId) {
      setIsNeedToGetUpdatedComments(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityIdWhichCommentsToUpdate, activityId]);

  return (
    <>
      {comments
        ?.slice()
        ?.sort((a: CommentResponse, b: CommentResponse) => Date.parse(a.date) - Date.parse(b.date))
        .map(({ authorId, comment, id, date, profile, commentLike }) => (
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
    </>
  );
}
