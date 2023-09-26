import { useAuth } from '@auth/context/auth-context';
import ActivityCardCommentBtn from '@c/activity-card-comment-btn/activity-card-comment-btn';
import ActivityCardDeleteBtn from '@c/activity-card-delete-btn/activity-card-delete-btn';
import ActivityCardLikeBtn from '@c/activity-card-like-btn/activity-card-like-btn';
import ActivityCardShareBtn from '@c/activity-card-share-btn/activity-card-share-btn';
import { ActivityCardBtnsContext } from '@u/context/activity-card-btns';
import { usePathname } from 'expo-router';
import { useState } from 'react';

export default function ActivityCardBtns({ activityId, userId }: { activityId: string; userId: string }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  return (
    <ActivityCardBtnsContext.Provider value={{ isLoading, isDisabled, setIsLoading, setIsDisabled }}>
      <ActivityCardLikeBtn activityId={activityId} />
      <ActivityCardCommentBtn activityId={activityId} />
      <ActivityCardShareBtn />
      {user.id === userId && pathname.includes(`/home/activity/${activityId}`) ? (
        <ActivityCardDeleteBtn activityId={activityId} />
      ) : null}
    </ActivityCardBtnsContext.Provider>
  );
}
