import { useContext, useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { ActivityIndicator, IconButton, MD3Colors } from 'react-native-paper';
import { useSelector } from 'react-redux';

import {
  CARD_LIKE_BTN,
  CARD_LIKE_BTN_ICON_LIKED,
  CARD_LIKE_BTN_ICON_NOT_LIKED,
  CARD_LIKE_BTN_TEST_ID_LIKED,
  CARD_LIKE_BTN_TEST_ID_NOT_LIKED,
} from './const';
import { useAuth } from '../../auth/context/auth-context';
import { useSendOrDeleteLikeMutation, useGetLikesByActivityIdQuery } from '../../redux/runich-api/runich-api';
import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';
import { errorHandler } from '../../utils/error-handler';

export default function ActivityCardLikeBtn({ activityId }: { activityId: string }) {
  const { user } = useAuth();
  const [sendLike, { data, error: errorSendingLike }] = useSendOrDeleteLikeMutation();
  const { language } = useSelector(({ language }) => language);
  const { isLoading: isLoadingLikes, isError, error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const isLikedByYou = likes?.some(({ authorId }) => authorId === user.id);
  const { isDisabled, isLoading, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);

  useEffect(() => {
    if (data) {
      if (!process.env.IS_TESTING) {
        console.log(data);
      }
    }
    if (errorSendingLike) {
      console.log(error);
      ToastAndroid.show(CARD_LIKE_BTN[language].errorMsg, ToastAndroid.SHORT);
    }
  }, [data, errorSendingLike]);

  return (
    <>
      {isLoadingLikes && <ActivityIndicator size="small" />}
      {!isLoadingLikes && (
        <IconButton
          testID={isLikedByYou ? CARD_LIKE_BTN_TEST_ID_LIKED : CARD_LIKE_BTN_TEST_ID_NOT_LIKED}
          icon={isLikedByYou ? CARD_LIKE_BTN_ICON_LIKED : CARD_LIKE_BTN_ICON_NOT_LIKED}
          iconColor={MD3Colors.primary50}
          size={25}
          onPress={async () => {
            setIsLoading(true);
            setIsDisabled(true);
            try {
              await sendLike({ activityId, authorId: user.id }).unwrap();
            } catch (error) {
              errorHandler(error);
            } finally {
              setIsLoading(false);
              setIsDisabled(false);
            }
          }}
          disabled={isLoading || isDisabled || isError}
        />
      )}
    </>
  );
}
