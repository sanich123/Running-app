import { useAuth } from '@A/context/auth-context';
import { setIsNeedToRefreshActivities } from '@R/main-feed/main-feed';
import {
  useGetYouFollowUsersByUserIdQuery,
  useDeleteFriendMutation,
  useAddFriendMutation,
} from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { errorExtracter } from '@U/error-handler';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { FOLLOW_UNFOLLOW_BTN } from './const';

export default function FollowUnfollowBtn({ friendId }: { friendId: string }) {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const {
    isLoading: isLoadingListOfFriends,
    error: listOfFriendsError,
    isError,
    data: listOfFriends,
  } = useGetYouFollowUsersByUserIdQuery(`${user?.id}`, { skip: !user });
  const { language } = useAppSelector(({ language }) => language);

  const friendCell = listOfFriends?.filter(
    ({ friendId: friendIdOnServer }: { friendId: string }) => friendIdOnServer === friendId,
  );
  const [deleteFriend, { isLoading: isLoadingDeleteFriend, error: friendDeletingError, isSuccess: isFriendDeleted }] =
    useDeleteFriendMutation();
  const [addFriend, { isLoading: isLoadingAddFriend, error: friendAddingError, isSuccess: isFriendAdded }] =
    useAddFriendMutation();

  useEffect(() => {
    if (!process.env.IS_TESTING) {
      if (isFriendDeleted) {
        dispatch(setIsNeedToRefreshActivities(true));
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(FOLLOW_UNFOLLOW_BTN[language].successUnfollowing);
        } else {
          toast.show(FOLLOW_UNFOLLOW_BTN[language].successUnfollowing);
        }
      }
      if (isFriendAdded) {
        dispatch(setIsNeedToRefreshActivities(true));
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(FOLLOW_UNFOLLOW_BTN[language].successFollowing);
        } else {
          toast.show(FOLLOW_UNFOLLOW_BTN[language].successFollowing);
        }
      }
      if (friendDeletingError || friendAddingError) {
        if (Platform.OS !== 'web') {
          showCrossPlatformToast(FOLLOW_UNFOLLOW_BTN[language].errorMsg);
        } else {
          toast.show(FOLLOW_UNFOLLOW_BTN[language].errorMsg);
        }
      }
    }
  }, [isFriendDeleted, isFriendAdded, friendDeletingError, friendAddingError, dispatch, language, toast]);

  return (
    <Button
      mode="contained"
      style={{ marginLeft: 'auto', borderRadius: 5, marginRight: 5 }}
      disabled={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend || isError}
      onPress={async () =>
        friendCell?.length > 0
          ? await deleteFriend(friendCell[0]?.id).unwrap()
          : await addFriend({ body: { userId: `${user?.id}` }, id: friendId }).unwrap()
      }>
      {!isError && isLoadingListOfFriends && ''}
      {!isError &&
        !isLoadingListOfFriends &&
        !isLoadingDeleteFriend &&
        !isLoadingAddFriend &&
        friendCell?.length > 0 &&
        FOLLOW_UNFOLLOW_BTN[language].unfollow}
      {!isError &&
        !isLoadingListOfFriends &&
        !isLoadingDeleteFriend &&
        !isLoadingAddFriend &&
        !friendCell?.length &&
        FOLLOW_UNFOLLOW_BTN[language].follow}
      {!isError &&
        (isLoadingAddFriend || isLoadingDeleteFriend) &&
        friendCell?.length > 0 &&
        FOLLOW_UNFOLLOW_BTN[language].unfollowing}
      {!isError &&
        (isLoadingAddFriend || isLoadingDeleteFriend) &&
        !friendCell?.length &&
        FOLLOW_UNFOLLOW_BTN[language].following}
      {isError && `${FOLLOW_UNFOLLOW_BTN[language].errorMsg}: ${errorExtracter(listOfFriendsError)}`}
    </Button>
  );
}
