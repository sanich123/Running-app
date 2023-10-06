import { usePathname } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '../../auth/context/auth-context';
import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';
import ActivityCardCommentBtn from '../card-comment-btn/card-comment-btn';
import ActivityCardDeleteBtn from '../card-delete-btn/card-delete-btn';
import ActivityCardLikeBtn from '../card-like-btn/card-like-btn';
import ActivityCardShareBtn from '../card-share-btn/card-share-btn';

export default function CardBtns({ activityId, userId }: { activityId: string; userId: string }) {
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
