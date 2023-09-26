import { useAuth } from '@auth/context/auth-context';
import { useAddFriendMutation } from '@r/runnich-api/runnich-api';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';

export default function AddFriendBtn({ friendId }: { friendId: string }) {
  const [addFriend, { data, error }] = useAddFriendMutation();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (data) {
      console.log(data);
    }
    if (error) {
      console.log(error);
    }
  }, [data, error]);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      onPress={async () => {
        setIsLoading(true);
        setIsDisabled(true);
        addFriend({ body: { userId: user.id }, id: friendId })
          .unwrap()
          .then((success) => {
            console.log(success);
            router.back();
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            setIsLoading(false);
            setIsDisabled(false);
          });
      }}
      disabled={isDisabled}
      loading={isLoading}>
      Follow
    </Button>
  );
}
