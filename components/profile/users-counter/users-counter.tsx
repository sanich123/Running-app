import { useAuth } from '@A/context/auth-context';
import { useGetFollowersByUserIdQuery, useGetYouFollowUsersByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { USERS_COUNT, USERS_VARIANT } from './const';

export default function UsersCounter({ variant }: { variant: USERS_VARIANT }) {
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();
  const { push } = useRouter();
  const { dark } = useTheme();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const whosId = friendId ? `${friendId}` : `${user?.id}`;
  const whereToPush = variant === USERS_VARIANT.whoUserFollows ? ROUTES.following : ROUTES.followers;
  const whatTitleToRender =
    variant === USERS_VARIANT.whoUserFollows ? USERS_COUNT[language].followings : USERS_COUNT[language].followers;

  const place = pathname.includes(ROUTES.home) ? ROUTES.home : ROUTES.profile;
  const {
    isLoading: isFollowersLoading,
    isError: isFollowersError,
    error: followersError,
    data: whoFollowsUserList,
  } = useGetFollowersByUserIdQuery(whosId, { skip: variant === USERS_VARIANT.whoUserFollows });

  const {
    isLoading: isFollowingsLoading,
    error: followingsError,
    isError: isFollowingsError,
    data: whoUserFollowsList,
  } = useGetYouFollowUsersByUserIdQuery(whosId, { skip: variant === USERS_VARIANT.whoFollowsUser });
  const whatErrorToRespond = variant === USERS_VARIANT.whoUserFollows ? followingsError : followersError;

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${place}/${whereToPush}/${whosId}`)}
      disabled={isFollowersError || isFollowersLoading || isFollowingsLoading || isFollowingsError}
      borderless
      style={{ borderRadius: 10 }}>
      <View style={{ paddingHorizontal: 5, paddingVertical: 2 }}>
        <Text variant="bodySmall">
          {isFollowersError || isFollowingsError ? `${USERS_COUNT[language].error}:` : whatTitleToRender}
        </Text>
        <Text variant="titleLarge">
          {(isFollowersLoading || isFollowingsLoading) && ' '}
          {whoFollowsUserList?.length && `${whoFollowsUserList?.length}`}
          {whoUserFollowsList?.length && `${whoUserFollowsList?.length}`}
          {whatErrorToRespond && `${errorExtracter(whatErrorToRespond)}`}
        </Text>
      </View>
    </TouchableRipple>
  );
}
