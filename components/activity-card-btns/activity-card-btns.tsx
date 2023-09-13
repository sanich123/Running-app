import { useSelector } from 'react-redux';

import ActivityCardCommentBtn from '../activity-card-comment-btn/activity-card-comment-btn';
import ActivityCardDeleteBtn from '../activity-card-delete-btn/activity-card-delete-btn';
import ActivityCardLikeBtn from '../activity-card-like-btn/activity-card-like-btn';
import ActivityCardShareBtn from '../activity-card-share-btn/activity-card-share-btn';

export default function ActivityCardBtns({ activityId, userId }: { activityId: string; userId: string }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  return (
    <>
      <ActivityCardLikeBtn activityId={activityId} />
      <ActivityCardCommentBtn activityId={activityId} />
      <ActivityCardShareBtn />
      {ownerId === userId ? <ActivityCardDeleteBtn activityId={activityId} /> : null}
    </>
  );
}
