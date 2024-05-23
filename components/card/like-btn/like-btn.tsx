import { useAuth } from '@A/context/auth-context';
import { useDeleteLikeMutation, useGetLikesByActivityIdQuery, useSendLikeMutation } from '@R/runich-api/runich-api';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { useContext, useEffect, memo, useState } from 'react';
import { Platform } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import {
  CARD_LIKE_BTN_TEST_ID_LIKED,
  CARD_LIKE_BTN_TEST_ID_NOT_LIKED,
  CARD_LIKE_BTN_ICON_LIKED,
  CARD_LIKE_BTN_ICON_NOT_LIKED,
} from './const';
import { LikeType } from '../const ';

export default memo(function CardLikeBtn({ activityId, likes }: { activityId: string; likes: LikeType[] }) {
  const [isInitial, setIsInitial] = useState(true);
  const toast = useToast();
  const { user } = useAuth();
  const { data: updatedLikes } = useGetLikesByActivityIdQuery(activityId, { skip: isInitial });
  const [sendLike, { data, error }] = useSendLikeMutation();
  const [deleteLike, { data: successDeleting, error: failureDeleting }] = useDeleteLikeMutation();
  const whatLikesToIterate = isInitial ? likes : updatedLikes;
  const isLikedByYou = whatLikesToIterate?.length
    ? whatLikesToIterate?.filter(({ authorId }: { authorId: string }) => authorId === user?.id)
    : null;
  const { isDisabled, isLoading } = useContext(ActivityCardBtnsContext);

  useEffect(() => {
    if (data || successDeleting) {
      if (Platform.OS === 'web') {
        toast.show('Action completed');
      } else {
        showCrossPlatformToast('Action completed', ToastDuration.short);
      }
      setIsInitial(false);
    }
    if (error || failureDeleting) {
      if (Platform.OS === 'web') {
        toast.show(`An error while ${failureDeleting ? 'deleting' : 'sending'} like`);
      } else {
        showCrossPlatformToast('An error while sending like', ToastDuration.long);
      }
    }
  }, [data, error]);

  return (
    <IconButton
      testID={isLikedByYou?.length ? CARD_LIKE_BTN_TEST_ID_LIKED : CARD_LIKE_BTN_TEST_ID_NOT_LIKED}
      icon={isLikedByYou?.length ? CARD_LIKE_BTN_ICON_LIKED : CARD_LIKE_BTN_ICON_NOT_LIKED}
      iconColor={MD3Colors.primary50}
      size={25}
      onPress={async () => {
        if (user) {
          if (isLikedByYou?.length) {
            await deleteLike(isLikedByYou[0].id).unwrap();
          } else {
            await sendLike({ activityId, authorId: user?.id }).unwrap();
          }
        }
      }}
      disabled={isLoading || isDisabled}
    />
  );
});
