import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useDeleteFriendMutation } from '../../redux/runnich-api/runnich-api';

export default function DeleteFriendBtn({ idOfFriendsCell }: { idOfFriendsCell: string }) {
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
      mode="outlined"
      disabled={isLoading}
      loading={isLoading}
      onPress={async () => await deleteFriend(idOfFriendsCell).unwrap()}>
      <Text variant="bodySmall">Delete friend</Text>
    </Button>
  );
}
