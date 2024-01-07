import { useAuth } from '@A/context/auth-context';
import ActivityCardCommentBtn from '@C/card-comment-btn/card-comment-btn';
import ActivityCardDeleteBtn from '@C/card-delete-btn/card-delete-btn';
import ActivityCardLikeBtn from '@C/card-like-btn/card-like-btn';
import ActivityCardShareBtn from '@C/card-share-btn/card-share-btn';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { MutableRefObject, ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type CardBtnsProps = {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<ReactNode>;
  fullViewRef: MutableRefObject<ReactNode | null>;
  isShowDeleteBtn: boolean;
};

export default function CardBtns({ activityId, userId, cardRef, fullViewRef, isShowDeleteBtn }: CardBtnsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const isMineActivvity = user?.id === userId;

  return (
    <ActivityCardBtnsContext.Provider value={{ isLoading, isDisabled, setIsLoading, setIsDisabled }}>
      <View style={styles.layout}>
        <ActivityCardLikeBtn activityId={activityId} />
        <ActivityCardCommentBtn activityId={activityId} />
        <ActivityCardShareBtn cardRef={cardRef} fullViewRef={fullViewRef} />
        {isMineActivvity && isShowDeleteBtn && <ActivityCardDeleteBtn activityId={activityId} />}
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
