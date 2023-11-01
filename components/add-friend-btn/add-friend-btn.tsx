import { useEffect, useState } from 'react';
import { Button } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import { useAddFriendMutation } from '../../redux/runich-api/runich-api';

export default function AddFriendBtn({ friendId }: { friendId: string }) {
  const [addFriend, { data, error }] = useAddFriendMutation();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (data) {
      console.log(data);
    }
    if (error) {
      console.log(error);
    }
    setIsLoading(false);
    setIsDisabled(false);
  }, [data, error]);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      onPress={async () => {
        setIsLoading(true);
        setIsDisabled(true);
        await addFriend({ body: { userId: user.id }, id: friendId }).unwrap();
      }}
      disabled={isDisabled}
      loading={isLoading}>
      Follow
    </Button>
  );
}
