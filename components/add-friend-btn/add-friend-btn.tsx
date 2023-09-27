import { useAuth } from '@auth/context/auth-context';
import { useAddFriendMutation } from '@r/runnich-api/runnich-api';
import { useState } from 'react';
import { Button } from 'react-native-paper';

export default function AddFriendBtn({ friendId }: { friendId: string }) {
  const [addFriend] = useAddFriendMutation();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      onPress={async () => {
        setIsLoading(true);
        setIsDisabled(true);
        await addFriend({ body: { userId: user.id }, id: friendId })
          .unwrap()
          .then((success) => console.log(success))
          .catch((error) => console.log(error))
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
