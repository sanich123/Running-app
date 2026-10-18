import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import {
  useGetYouFollowUsersByUserIdQuery,
  useDeleteFriendMutation,
  useAddFriendMutation,
} from '@R/services/followers/followers';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { FOLLOW_UNFOLLOW_BTN } from './const';
import type { FollowUnfollowBtnProps } from './types';

export default function FollowUnfollowBtn({ friendId, compact = false }: FollowUnfollowBtnProps) {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    isLoading: isLoadingListOfFriends,
    error: listOfFriendsError,
    isError,
    data: listOfFriends,
  } = useGetYouFollowUsersByUserIdQuery(userId, { skip: !userId });
  const { language } = useAppSelector(({ settings }) => settings);

  const friendCell = (listOfFriends ?? []).filter(
    ({ friendId: friendIdOnServer }: { friendId: string }) => friendIdOnServer === friendId,
  );
  const [deleteFriend, { isLoading: isLoadingDeleteFriend }] = useDeleteFriendMutation();
  const [addFriend, { isLoading: isLoadingAddFriend }] = useAddFriendMutation();
  const isLoading = isLoadingListOfFriends || isLoadingDeleteFriend || isLoadingAddFriend;
  const isFollowing = friendCell.length > 0;

  return (
    <Button
      compact={compact}
      mode={isFollowing ? 'outlined' : 'contained'}
      icon={compact ? undefined : isFollowing ? 'check' : 'account-plus-outline'}
      buttonColor={isFollowing ? colors.surface : colors.primary}
      textColor={isFollowing ? colors.onSurface : colors.onPrimary}
      loading={isLoading}
      contentStyle={[styles.content, compact && styles.compactContent]}
      labelStyle={[styles.label, compact && styles.compactLabel]}
      style={[compact ? styles.compactButton : styles.button, isFollowing && { borderColor: colors.outlineVariant }]}
      disabled={isLoading || isError}
      onPress={async () => {
        try {
          if (friendCell.length > 0) await deleteFriend(friendCell[0].id).unwrap();
          else await addFriend({ id: friendId }).unwrap();
        } catch (error) {
          errorToast(FOLLOW_UNFOLLOW_BTN[language].errorMsg, error);
        }
      }}>
      {!isError && !isLoading && isFollowing && FOLLOW_UNFOLLOW_BTN[language].unfollow}
      {!isError && !isLoading && !isFollowing && FOLLOW_UNFOLLOW_BTN[language].follow}
      {isError && `${FOLLOW_UNFOLLOW_BTN[language].errorMsg}: ${getErrorMessageFromError(listOfFriendsError)}`}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    width: '100%',
  },
  compactButton: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    minWidth: 112,
  },
  content: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  compactContent: {
    height: 32,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  compactLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginHorizontal: 4,
    marginVertical: 0,
  },
});
