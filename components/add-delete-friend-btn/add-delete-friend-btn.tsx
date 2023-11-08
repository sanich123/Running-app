import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import {
  useAddFriendMutation,
  useDeleteFriendMutation,
  useGetFriendsByUserIdQuery,
} from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function AddDeleteFriendBtn({ friendId }: { friendId: string }) {
  const { user } = useAuth();
  const {
    isLoading: isLoadingListOfFriends,
    error: listOfFriendsError,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery(user.id);

  const friendCell = listOfFriends?.filter(({ friendId: friendIdOnServer }) => friendIdOnServer === friendId);
  const [deleteFriend, { isLoading: isLoadingDeleteFriend, data: friendDeleted, error: friendDeletingError }] =
    useDeleteFriendMutation();
  const [addFriend, { isLoading: isLoadingAddFriend, data: friendAdded, error: friendAddingError }] =
    useAddFriendMutation();

  useEffect(() => {
    if (friendDeleted || friendAdded) {
      ToastAndroid.show('You have successfully delete a friend!', ToastAndroid.SHORT);
    }
    if (friendDeletingError || friendAddingError) {
      ToastAndroid.show('An error occured', ToastAndroid.SHORT);
    }
  }, [friendDeleted, friendAdded, friendDeletingError, friendAddingError]);

  return (
    <>
      {isLoadingListOfFriends && <ActivityIndicator size="small" />}
      {listOfFriendsError && <ErrorComponent error={listOfFriendsError} />}
      {listOfFriends && (
        <Button
          mode="contained"
          style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
          disabled={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend}
          loading={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend}
          onPress={async () =>
            friendCell?.length > 0
              ? await deleteFriend({ body: { userId: user.id }, id: friendId }).unwrap()
              : await addFriend({ body: { userId: user.id }, id: friendId }).unwrap()
          }>
          {`${friendCell.length > 0 ? 'Unf' : 'F'}ollow${
            isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend ? 'ing' : ''
          }`}
        </Button>
      )}
    </>
  );
}
