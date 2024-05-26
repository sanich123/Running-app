import { useAuth } from '@A/context/auth-context';
import { setActivityIdWhichLikesToUpdate } from '@R/main-feed/main-feed';
import { useDeleteLikeMutation, useGetLikesByActivityIdQuery, useSendLikeMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { showCrossPlatformToast } from '@U/custom-toast';
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
import { LIKE_BTN } from '../likes/const';

export default memo(function LikeBtn({ activityId, likes }: { activityId: string; likes: LikeType[] }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAuth();
  const { isDisabled, isLoading } = useContext(ActivityCardBtnsContext);
  const [isNeedToGetUpdatedLikes, setIsNeedToGetUpdatedLikes] = useState(true);
  const { language } = useAppSelector(({ language }) => language);
  const { activityIdWhichLikesToUpdate } = useAppSelector(({ mainFeed }) => mainFeed);
  const {
    profileFromServer: { profilePhoto },
  } = useAppSelector(({ profile }) => profile);
  const { data: updatedLikes, isError } = useGetLikesByActivityIdQuery(activityId, {
    skip: !isNeedToGetUpdatedLikes,
  });
  const [sendLike, { error: errorSending }] = useSendLikeMutation();
  const [deleteLike, { error: failureDeleting }] = useDeleteLikeMutation();
  const whatLikesToIterate = !isNeedToGetUpdatedLikes ? likes : updatedLikes;

  const isLikedByYou = whatLikesToIterate?.length
    ? whatLikesToIterate?.filter(({ authorId }: { authorId: string }) => authorId === user?.id)
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

  useEffect(() => {
    if (activityIdWhichLikesToUpdate === activityId) {
      setIsNeedToGetUpdatedLikes(true);
    }
  }, [activityIdWhichLikesToUpdate, activityId]);

  return (
    <IconButton
      testID={isLikedByYou?.length ? CARD_LIKE_BTN_TEST_ID_LIKED : CARD_LIKE_BTN_TEST_ID_NOT_LIKED}
      icon={isLikedByYou?.length ? CARD_LIKE_BTN_ICON_LIKED : CARD_LIKE_BTN_ICON_NOT_LIKED}
      iconColor={isError ? MD3Colors.error0 : MD3Colors.primary50}
      size={25}
      onPress={async () => {
        if (user) {
          if (isLikedByYou?.length) {
            await deleteLike({ id: isLikedByYou[0].id, activityId }).unwrap();
          } else {
            await sendLike({ activityId, authorId: user?.id, profilePhoto }).unwrap();
          }
          setIsNeedToGetUpdatedLikes(true);
          dispatch(setActivityIdWhichLikesToUpdate(activityId));
        }
      }}
      disabled={isLoading || isDisabled || isError}
    />
  );
});
