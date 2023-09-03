import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useGetLikesByActivityIdQuery, useSendOrDeleteLikeMutation } from '../../redux/runnich-api/runnich-api';

export default function ActivityCardLikeBtn({ activityId }: { activityId: string }) {
  const { id: userId } = useSelector(({ userInfo }) => userInfo);
  const [sendLike, { data, error: errorSendingLike }] = useSendOrDeleteLikeMutation();
  const { isLoading, error, data: likes } = useGetLikesByActivityIdQuery(activityId);
  const isLikedByYou = likes?.some(({ authorId }) => authorId === userId);

  useEffect(() => {
    if (data) {
      console.log(likes);
      ToastAndroid.show('Successfully send request to like or dislike', ToastAndroid.SHORT);
    }
    if (errorSendingLike) {
      console.log(error);
      ToastAndroid.show('An error occured while sending request to like', ToastAndroid.SHORT);
    }
  }, [data, errorSendingLike]);

  return (
    <IconButton
      icon={`thumb-up${isLikedByYou ? '' : '-outline'}`}
      iconColor={MD3Colors.error50}
      size={20}
      onPress={async () => {
        const body = { activityId, authorId: userId };
        await sendLike(body).unwrap();
      }}
      disabled={isLoading}
    />
  );
}
