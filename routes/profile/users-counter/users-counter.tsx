import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetFollowersByUserIdQuery, useGetYouFollowUsersByUserIdQuery } from '@R/services/followers/followers';
import { useAppSelector } from '@R/typed-hooks';
import { USERS_COUNT, USERS_VARIANT } from './const';

export default function UsersCounter({ variant }: { variant: USERS_VARIANT }) {
  const { language } = useAppSelector(({ language }) => language);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { push } = useRouter();
  const { dark } = useTheme();
  const { id: friendId } = useLocalSearchParams();
  const whosId = friendId ? `${friendId}` : userId;
  const whereToPush = variant === USERS_VARIANT.whoUserFollows ? ROUTES.following : ROUTES.followers;
  const whatTitleToRender =
    variant === USERS_VARIANT.whoUserFollows ? USERS_COUNT[language].followings : USERS_COUNT[language].followers;
  const {
    isLoading: isFollowersLoading,
    isError: isFollowersError,
    data: whoFollowsUserList,
  } = useGetFollowersByUserIdQuery(whosId, { skip: variant === USERS_VARIANT.whoUserFollows });

  const {
    isLoading: isFollowingsLoading,
    isError: isFollowingsError,
    data: whoUserFollowsList,
  } = useGetYouFollowUsersByUserIdQuery(whosId, { skip: variant === USERS_VARIANT.whoFollowsUser });
  if (isFollowersError || isFollowingsError) {
    return null;
  }

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${whereToPush}/${whosId}`)}
      disabled={isFollowersError || isFollowersLoading || isFollowingsLoading || isFollowingsError}
      borderless
      style={{ borderRadius: 8 }}>
      <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
        <Text variant="labelSmall">{whatTitleToRender}</Text>
        <Text variant="titleMedium" style={{ fontFamily: FONT_FAMILIES.extraBold }}>
          {(isFollowersLoading || isFollowingsLoading) && ' '}
          {whoFollowsUserList?.length && `${whoFollowsUserList?.length}`}
          {whoUserFollowsList?.length && `${whoUserFollowsList?.length}`}
        </Text>
      </View>
    </TouchableRipple>
  );
}
