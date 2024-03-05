import { useAuth } from '@A/context/auth-context';
import { useGetFriendsByUserIdQuery, useDeleteFriendMutation, useAddFriendMutation } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { errorExtracter } from '@U/error-handler';
import { useEffect } from 'react';
import { Platform } from 'react-native';
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
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(ADD_DELETE_FRIEND_BTN[language].successUnfollowing, ToastDuration.short);
        }
      }
      if (friendAdded) {
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(ADD_DELETE_FRIEND_BTN[language].successFollowing, ToastDuration.short);
        }
      }
      if (friendDeletingError || friendAddingError) {
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(ADD_DELETE_FRIEND_BTN[language].errorMsg, ToastDuration.short);
        }
      }
    }
  }, [friendDeleted, friendAdded, friendDeletingError, friendAddingError]);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      disabled={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend || isError}
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
