import { useAuth } from '@auth/context/auth-context';
import { useGetLikesByActivityIdQuery, useSendOrDeleteLikeMutation } from '@r/runnich-api/runnich-api';
import { ActivityCardBtnsContext } from '@u/context/activity-card-btns';
import { errorHandler } from '@u/error-handler';
import { useContext, useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';

export default function ActivityCardLikeBtn({ activityId }: { activityId: string }) {
  const { user } = useAuth();
  const [sendLike, { data, error: errorSendingLike }] = useSendOrDeleteLikeMutation();
  const { error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const isLikedByYou = likes?.find(({ authorId }) => authorId === user.id);
  const { isDisabled, isLoading, setIsLoading, setIsDisabled } = useContext(ActivityCardBtnsContext);

  useEffect(() => {
    if (data) {
      console.log(likes);
      ToastAndroid.show('Successfully send request to like or dislike', ToastAndroid.SHORT);
      setIsLoading(false);
      setIsDisabled(false);
    }
    if (errorSendingLike) {
      console.log(error);
      ToastAndroid.show('An error occured while sending request to like', ToastAndroid.SHORT);
      setIsLoading(false);
      setIsDisabled(false);
    }
  }, [data, errorSendingLike]);

  return (
    <IconButton
      icon={`thumb-up${isLikedByYou ? '' : '-outline'}`}
      iconColor={MD3Colors.primary50}
      size={25}
      onPress={async () => {
        setIsLoading(true);
        setIsDisabled(true);
        try {
          const body = { activityId, authorId: user.id };
          await sendLike(body).unwrap();
        } catch (error) {
          errorHandler(error);
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}
      disabled={isLoading || isDisabled}
    />
  );
}
