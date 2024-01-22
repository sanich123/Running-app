import { useAuth } from '@A/context/auth-context';
import { useSendOrDeleteLikeMutation, useGetLikesByActivityIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityCardBtnsContext } from '@U/context/activity-card-btns';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { errorHandler } from '@U/error-handler';
import { useContext, useEffect } from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';

import {
  CARD_LIKE_BTN,
  CARD_LIKE_BTN_TEST_ID_LIKED,
  CARD_LIKE_BTN_TEST_ID_NOT_LIKED,
  CARD_LIKE_BTN_ICON_LIKED,
  CARD_LIKE_BTN_ICON_NOT_LIKED,
} from './const';

export default function ActivityCardLikeBtn({ activityId }: { activityId: string }) {
  const { user } = useAuth();
  const [sendLike, { data, error: errorSendingLike }] = useSendOrDeleteLikeMutation();
  const { language } = useAppSelector(({ language }) => language);
  const { isError, error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const isLikedByYou = likes?.length
    ? likes?.some(({ authorId }: { authorId: string }) => authorId === user?.id)
    : null;
  const { isDisabled, isLoading, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);

  useEffect(() => {
    if (data) {
      if (!process.env.IS_TESTING) {
        console.log(data);
      }
    }
    if (errorSendingLike) {
      console.log(error);
      showCrossPlatformToast(CARD_LIKE_BTN[language].errorMsg, ToastDuration.short);
    }
  }, [data, errorSendingLike]);

  return (
    <>
      <IconButton
        testID={isLikedByYou ? CARD_LIKE_BTN_TEST_ID_LIKED : CARD_LIKE_BTN_TEST_ID_NOT_LIKED}
        icon={isLikedByYou ? CARD_LIKE_BTN_ICON_LIKED : CARD_LIKE_BTN_ICON_NOT_LIKED}
        iconColor={MD3Colors.primary50}
        size={25}
        onPress={async () => {
          setIsLoading(true);
          setIsDisabled(true);
          try {
            if (user) {
              await sendLike({ activityId, authorId: user?.id }).unwrap();
            }
          } catch (error) {
            errorHandler(error);
          } finally {
            setIsLoading(false);
            setIsDisabled(false);
          }
        }}
        disabled={isLoading || isDisabled || isError}
      />
    </>
  );
}
