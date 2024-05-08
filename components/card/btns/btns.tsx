import { useAuth } from '@A/context/auth-context';
import CommentBtn from '@C/card/comment-btn/comment-btn';
import { CommentType, LikeType } from '@C/card/const ';
import DeleteBtn from '@C/card/delete-btn/delete-btn';
import LikeBtn from '@C/card/like-btn/like-btn';
import LikeBtnSimple from '@C/card/like-btn/like-btn-simple';
import ShareBtn from '@C/card/share-btn/share-btn';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { MutableRefObject, ReactNode, useState, memo } from 'react';
import { StyleSheet, View } from 'react-native';

type CardBtnsProps = {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<ReactNode>;
  fullViewRef: MutableRefObject<ReactNode | null>;
  isShowDeleteBtn: boolean;
  likes: LikeType[];
  comments: CommentType[];
};

export default memo(function CardBtns({
  activityId,
  userId,
  cardRef,
  fullViewRef,
  isShowDeleteBtn,
  likes,
  comments,
}: CardBtnsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const isMineActivity = user?.id === userId;

  return (
    <ActivityCardBtnsContext.Provider value={{ isLoading, isDisabled, setIsLoading, setIsDisabled }}>
      <View style={styles.layout}>
        {likes?.length ? <LikeBtn activityId={activityId} /> : <LikeBtnSimple activityId={activityId} />}
        <CommentBtn activityId={activityId} comments={comments} />
        <ShareBtn cardRef={cardRef} fullViewRef={fullViewRef} />
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
