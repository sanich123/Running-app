import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useAddFriendMutation } from '../../redux/runnich-api/runnich-api';
import { Text } from '../Themed';

export default function AddFriendBtn({ friendId }: { friendId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [addFriend, { data, error }] = useAddFriendMutation();

  const { id } = useSelector(({ userInfo }) => userInfo);

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
      mode="outlined"
      icon="logout"
      style={{ marginTop: 15 }}
      onPress={async () => {
        setIsLoading(true);
        setIsDisabled(true);
        addFriend({ userId: id, friendId: friendId.toString() })
          .unwrap()
          .then((success) => {
            console.log(success);
            setIsLoading(false);
            setIsDisabled(false);
            router.back();
          })
          .catch((error) => {
            console.log(error);
            setIsLoading(false);
            setIsDisabled(false);
          });
      }}
      disabled={isDisabled}
      loading={isLoading}>
      <Text>Follow</Text>
    </Button>
  );
}
