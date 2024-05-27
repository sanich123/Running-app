import { useAuth } from '@A/context/auth-context';
import { useDeleteLikeMutation, useGetLikesByActivityIdQuery, useSendLikeMutation } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useContext, useEffect, memo } from 'react';
import { Platform } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import {
  CARD_LIKE_BTN_TEST_ID_LIKED,
  CARD_LIKE_BTN_TEST_ID_NOT_LIKED,
  CARD_LIKE_BTN_ICON_LIKED,
  CARD_LIKE_BTN_ICON_NOT_LIKED,
} from './const';
import { LIKE_BTN } from '../likes/const';

export default memo(function LikeBtn({ activityId }: { activityId: string }) {
  const toast = useToast();
  const { user } = useAuth();
  const { isDisabled, isLoading } = useContext(ActivityCardBtnsContext);
  const { language } = useAppSelector(({ language }) => language);
  const {
    profileFromServer: { profilePhoto },
  } = useAppSelector(({ profile }) => profile);
  const { data: likes, isError, isLoading: isLikesLoading } = useGetLikesByActivityIdQuery(activityId);
  const [sendLike, { error: errorSending }] = useSendLikeMutation();
  const [deleteLike, { error: failureDeleting }] = useDeleteLikeMutation();

  const isLikedByYou = likes?.length
    ? likes?.filter(({ authorId }: { authorId: string }) => authorId === user?.id)
    : null;

  useEffect(() => {
    if (errorSending || failureDeleting) {
      const event = LIKE_BTN[language].errorAction(failureDeleting ? 'delete' : 'send');
      if (Platform.OS === 'web') {
        toast.show(event);
      } else {
        showCrossPlatformToast(event);
      }
    }
  }, [errorSending, failureDeleting]);

  return (
    <IconButton
      testID={isLikedByYou?.length > 0 ? CARD_LIKE_BTN_TEST_ID_LIKED : CARD_LIKE_BTN_TEST_ID_NOT_LIKED}
      icon={isLikedByYou?.length > 0 ? CARD_LIKE_BTN_ICON_LIKED : CARD_LIKE_BTN_ICON_NOT_LIKED}
      iconColor={isError ? MD3Colors.error0 : MD3Colors.primary50}
      size={25}
      onPress={async () => {
        if (user) {
          if (isLikedByYou?.length > 0) {
            await deleteLike({ id: isLikedByYou[0].id, activityId }).unwrap();
          } else {
            await sendLike({ activityId, authorId: `${user?.id}`, profilePhoto }).unwrap();
          }
        }
      }}
      disabled={isLoading || isDisabled || isError || isLikesLoading || !!likes?.message}
    />
  );
});
