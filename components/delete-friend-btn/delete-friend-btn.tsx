import { useAuth } from '@auth/context/auth-context';
import { useDeleteFriendMutation } from '@r/runnich-api/runnich-api';
import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';

export default function DeleteFriendBtn({ friendId }: { friendId: string }) {
  const { user } = useAuth();
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
      onPress={async () => await deleteFriend({ body: { userId: user.id }, id: friendId }).unwrap()}>
      Unfollow
    </Button>
  );
}
