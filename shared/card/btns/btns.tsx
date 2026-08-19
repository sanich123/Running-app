import { useState, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import CommentBtn from '@S/card/comment-btn/comment-btn';
import DeleteBtn from '@S/card/delete-btn/delete-btn';
import LikeBtn from '@S/card/like-btn/like-btn';
import ShareBtn from '@S/card/share-btn/share-btn';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import type { CardBtnsProps } from '../types';

export default memo(function CardBtns({
  activityId,
  userId,
  cardRef,
  isShowDeleteBtn,
  commentsLength,
  profile,
  mapPhotoUrl,
}: CardBtnsProps) {
  const { userId: ownerId } = useAppSelector(({ auth }) => auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const isMineActivity = ownerId === userId;

  return (
    <ActivityCardBtnsContext.Provider value={{ isLoading, isDisabled, setIsLoading, setIsDisabled }}>
      <View style={styles.layout}>
        <LikeBtn activityId={activityId} profile={profile} mapPhotoUrl={mapPhotoUrl} />
        <CommentBtn
          activityId={activityId}
          commentsLength={commentsLength}
          profile={profile}
          mapPhotoUrl={mapPhotoUrl}
        />
        <ShareBtn cardRef={cardRef} />
        {isMineActivity && isShowDeleteBtn && <DeleteBtn activityId={activityId} />}
      </View>
    </ActivityCardBtnsContext.Provider>
  );
});

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
