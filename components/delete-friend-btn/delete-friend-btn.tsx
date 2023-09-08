import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';

import { useDeleteFriendMutation } from '../../redux/runnich-api/runnich-api';

export default function DeleteFriendBtn({ idOfFriendCell }: { idOfFriendCell: string }) {
  const [deleteFriend, { isLoading, data, error }] = useDeleteFriendMutation();

  useEffect(() => {
    if (data) {
      ToastAndroid.show('You have successfully added a friend!', ToastAndroid.SHORT);
    }
    if (error) {
      ToastAndroid.show('An error occured', ToastAndroid.SHORT);
      console.log(error);
    }
  }, [data, error]);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      disabled={isLoading}
      loading={isLoading}
      onPress={async () => await deleteFriend(idOfFriendCell).unwrap()}>
      Unfollow
    </Button>
  );
}
