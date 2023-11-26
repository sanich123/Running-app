import { useAuth } from '@A/context/auth-context';
import { useGetFriendsByUserIdQuery, useDeleteFriendMutation, useAddFriendMutation } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';

import { ADD_DELETE_FRIEND_BTN } from './const';

export default function AddDeleteFriendBtn({ friendId }: { friendId: string }) {
  const { user } = useAuth();
  const {
    isLoading: isLoadingListOfFriends,
    error: listOfFriendsError,
    isError,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery(user?.id ?? '');
  const { language } = useAppSelector(({ language }) => language);
  const friendCell = listOfFriends?.filter(
    ({ friendId: friendIdOnServer }: { friendId: string }) => friendIdOnServer === friendId,
  );
  const [deleteFriend, { isLoading: isLoadingDeleteFriend, data: friendDeleted, error: friendDeletingError }] =
    useDeleteFriendMutation();
  const [addFriend, { isLoading: isLoadingAddFriend, data: friendAdded, error: friendAddingError }] =
    useAddFriendMutation();

  useEffect(() => {
    if (!process.env.IS_TESTING) {
      if (friendDeleted) {
        ToastAndroid.show(ADD_DELETE_FRIEND_BTN[language].successUnfollowing, ToastAndroid.SHORT);
      }
      if (friendAdded) {
        ToastAndroid.show(ADD_DELETE_FRIEND_BTN[language].successFollowing, ToastAndroid.SHORT);
      }
      if (friendDeletingError || friendAddingError) {
        ToastAndroid.show(ADD_DELETE_FRIEND_BTN[language].errorMsg, ToastAndroid.SHORT);
      }
    }
  }, [friendDeleted, friendAdded, friendDeletingError, friendAddingError]);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      disabled={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend || isError}
      loading={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend}
      onPress={async () => {
        if (user) {
          if (friendCell?.length > 0) {
            await deleteFriend({ body: { userId: user.id }, id: friendId }).unwrap();
          } else {
            await addFriend({ body: { userId: user.id }, id: friendId }).unwrap();
          }
        }
      }}>
      {!isError && isLoadingListOfFriends && ''}
      {!isError &&
        !isLoadingListOfFriends &&
        !isLoadingDeleteFriend &&
        !isLoadingAddFriend &&
        friendCell?.length > 0 &&
        ADD_DELETE_FRIEND_BTN[language].unfollow}
      {!isError &&
        !isLoadingListOfFriends &&
        !isLoadingDeleteFriend &&
        !isLoadingAddFriend &&
        !friendCell?.length &&
        ADD_DELETE_FRIEND_BTN[language].follow}
      {!isError &&
        (isLoadingAddFriend || isLoadingDeleteFriend) &&
        friendCell?.length > 0 &&
        ADD_DELETE_FRIEND_BTN[language].unfollowing}
      {!isError &&
        (isLoadingAddFriend || isLoadingDeleteFriend) &&
        !friendCell?.length &&
        ADD_DELETE_FRIEND_BTN[language].following}
      {isError && `${ADD_DELETE_FRIEND_BTN[language].errorMsg}: ${errorExtracter(listOfFriendsError)}`}
    </Button>
  );
}
