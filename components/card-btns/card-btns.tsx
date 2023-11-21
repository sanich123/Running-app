import { usePathname } from 'expo-router';
import { MutableRefObject, ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '../../auth/context/auth-context';
import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';
import ActivityCardCommentBtn from '../card-comment-btn/card-comment-btn';
import ActivityCardDeleteBtn from '../card-delete-btn/card-delete-btn';
import ActivityCardLikeBtn from '../card-like-btn/card-like-btn';
import ActivityCardShareBtn from '../card-share-btn/card-share-btn';

type CardBtnsProps = {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<ReactNode>;
};

export default function CardBtns({ activityId, userId, cardRef }: CardBtnsProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const isMineActivvity = user.id === userId;

  return (
    <ActivityCardBtnsContext.Provider value={{ isLoading, isDisabled, setIsLoading, setIsDisabled }}>
      <View style={styles.layout}>
        <ActivityCardLikeBtn activityId={activityId} />
        <ActivityCardCommentBtn activityId={activityId} />
        <ActivityCardShareBtn cardRef={cardRef} />
        {isMineActivvity && pathname.includes(`/home/activity/${activityId}`) && (
          <ActivityCardDeleteBtn activityId={activityId} />
        )}
      </View>
    </ActivityCardBtnsContext.Provider>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
