import { usePathname } from 'expo-router';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';
import ActivityCardCommentBtn from '../activity-card-comment-btn/activity-card-comment-btn';
import ActivityCardDeleteBtn from '../activity-card-delete-btn/activity-card-delete-btn';
import ActivityCardLikeBtn from '../activity-card-like-btn/activity-card-like-btn';
import ActivityCardShareBtn from '../activity-card-share-btn/activity-card-share-btn';

export default function ActivityCardBtns({ activityId, userId }: { activityId: string; userId: string }) {
  const { id: ownerId } = useSelector(({ userInfo }) => userInfo);
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  return (
    <ActivityCardBtnsContext.Provider value={{ isLoading, isDisabled, setIsLoading, setIsDisabled }}>
      <ActivityCardLikeBtn activityId={activityId} />
      <ActivityCardCommentBtn activityId={activityId} />
      <ActivityCardShareBtn />
      {ownerId === userId && pathname.includes(`/home/activity/${activityId}`) ? (
        <ActivityCardDeleteBtn activityId={activityId} />
      ) : null}
    </ActivityCardBtnsContext.Provider>
  );
}
