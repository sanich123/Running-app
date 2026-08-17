import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import {
  useGetYouFollowUsersByUserIdQuery,
  useDeleteFriendMutation,
  useAddFriendMutation,
} from '@R/services/followers/followers';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import { FOLLOW_UNFOLLOW_BTN } from './const';

export default function FollowUnfollowBtn({ friendId }: { friendId: string }) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    isLoading: isLoadingListOfFriends,
    error: listOfFriendsError,
    isError,
    data: listOfFriends,
  } = useGetYouFollowUsersByUserIdQuery(userId, { skip: !userId });
  const { language } = useAppSelector(({ language }) => language);

  const friendCell = (listOfFriends ?? []).filter(
    ({ friendId: friendIdOnServer }: { friendId: string }) => friendIdOnServer === friendId,
  );
  const [deleteFriend, { isLoading: isLoadingDeleteFriend }] = useDeleteFriendMutation();
  const [addFriend, { isLoading: isLoadingAddFriend }] = useAddFriendMutation();
  const isLoading = isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend;

  return (
    <Button
      mode="outlined"
      compact
      loading={isLoading}
      contentStyle={styles.content}
      labelStyle={styles.label}
      style={styles.button}
      disabled={isLoading || isError}
      onPress={async () => {
        try {
          if (friendCell.length > 0) await deleteFriend(friendCell[0].id).unwrap();
          else await addFriend({ body: { userId }, id: friendId }).unwrap();
        } catch (error) {
          errorToast(FOLLOW_UNFOLLOW_BTN[language].errorMsg, error);
        }
      }}>
      {!isError && !isLoading && friendCell.length > 0 && FOLLOW_UNFOLLOW_BTN[language].unfollow}
      {!isError && !isLoading && !friendCell.length && FOLLOW_UNFOLLOW_BTN[language].follow}
      {isError && `${FOLLOW_UNFOLLOW_BTN[language].errorMsg}: ${getErrorMessageFromError(listOfFriendsError)}`}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexShrink: 0,
    marginLeft: 'auto',
    width: 132,
  },
  content: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 0,
  },
  label: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 12,
    lineHeight: 14,
  },
});
