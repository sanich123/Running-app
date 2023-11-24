import { useAuth } from '@A/context/auth-context';
import { useGetFriendsByUserIdQuery, useDeleteFriendMutation, useAddFriendMutation } from '@R/runich-api/runich-api';
import { errorExtracter } from '@U/error-handler';
import { useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { ADD_DELETE_FRIEND_BTN } from './const';

export default function AddDeleteFriendBtn({ friendId }: { friendId: string }) {
  const { user } = useAuth();
  const {
    isLoading: isLoadingListOfFriends,
    error: listOfFriendsError,
    isError,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery(user.id);
  const { language } = useSelector(({ language }) => language);
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
        ToastAndroid.show(
          ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].successUnfollowing,
          ToastAndroid.SHORT,
        );
      }
      if (friendAdded) {
        ToastAndroid.show(
          ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].successFollowing,
          ToastAndroid.SHORT,
        );
      }
      if (friendDeletingError || friendAddingError) {
        ToastAndroid.show(
          ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].errorMsg,
          ToastAndroid.SHORT,
        );
      }
    }
  }, [friendDeleted, friendAdded, friendDeletingError, friendAddingError]);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      disabled={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend || isError}
      loading={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend}
      onPress={async () =>
        friendCell?.length > 0
          ? await deleteFriend({ body: { userId: user.id }, id: friendId }).unwrap()
          : await addFriend({ body: { userId: user.id }, id: friendId }).unwrap()
      }>
      {!isError && isLoadingListOfFriends && ''}
      {!isError &&
        !isLoadingListOfFriends &&
        !isLoadingDeleteFriend &&
        !isLoadingAddFriend &&
        friendCell?.length > 0 &&
        ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].unfollow}
      {!isError &&
        !isLoadingListOfFriends &&
        !isLoadingDeleteFriend &&
        !isLoadingAddFriend &&
        !friendCell?.length &&
        ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].follow}
      {!isError &&
        (isLoadingAddFriend || isLoadingDeleteFriend) &&
        friendCell?.length > 0 &&
        ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].unfollowing}
      {!isError &&
        (isLoadingAddFriend || isLoadingDeleteFriend) &&
        !friendCell?.length &&
        ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].following}
      {isError &&
        `${ADD_DELETE_FRIEND_BTN[language as keyof typeof ADD_DELETE_FRIEND_BTN].errorMsg}: ${errorExtracter(
          listOfFriendsError,
        )}`}
    </Button>
  );
}
