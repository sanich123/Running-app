import { useEffect } from 'react';
import { Button } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import {
  useGetYouFollowUsersByUserIdQuery,
  useDeleteFriendMutation,
  useAddFriendMutation,
} from '@R/services/followers/followers';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { errorExtracter } from '@U/error-handler';
import { FOLLOW_UNFOLLOW_BTN } from './const';

export default function FollowUnfollowBtn({ friendId }: { friendId: string }) {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    isLoading: isLoadingListOfFriends,
    error: listOfFriendsError,
    isError,
    data: listOfFriends,
  } = useGetYouFollowUsersByUserIdQuery(userId, { skip: !userId });
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
        showCrossPlatformToast(FOLLOW_UNFOLLOW_BTN[language].successUnfollowing);
      }
      if (isFriendAdded) {
        showCrossPlatformToast(FOLLOW_UNFOLLOW_BTN[language].successFollowing);
      }
      if (friendDeletingError || friendAddingError) {
        showCrossPlatformToast(FOLLOW_UNFOLLOW_BTN[language].errorMsg);
      }
    }
  }, [isFriendDeleted, isFriendAdded, friendDeletingError, friendAddingError, dispatch, language]);

  return (
    <Button
      mode="contained"
      contentStyle={{ height: 48 }}
      labelStyle={{ fontFamily: FONT_FAMILIES.semiBold }}
      style={{ marginLeft: 'auto', borderRadius: 8 }}
      disabled={isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend || isError}
      onPress={async () =>
        friendCell?.length > 0
          ? await deleteFriend(friendCell[0]?.id).unwrap()
          : await addFriend({ body: { userId }, id: friendId }).unwrap()
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
