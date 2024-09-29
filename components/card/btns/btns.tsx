import { useAuth } from '@A/context/auth-context';
import CommentBtn from '@C/card/comment-btn/comment-btn';
import DeleteBtn from '@C/card/delete-btn/delete-btn';
import LikeBtn from '@C/card/like-btn/like-btn';
import ShareBtn from '@C/card/share-btn/share-btn';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { useState, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CardBtnsProps } from '../types';

export default memo(function CardBtns({ activityId, userId, cardRef, isShowDeleteBtn, commentsLength }: CardBtnsProps) {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const isMineActivity = user?.id === userId;

  return (
    <ActivityCardBtnsContext.Provider value={{ isLoading, isDisabled, setIsLoading, setIsDisabled }}>
      <View style={styles.layout}>
        <LikeBtn activityId={activityId} />
        <CommentBtn activityId={activityId} commentsLength={commentsLength} />
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
