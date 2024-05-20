import { useAuth } from '@A/context/auth-context';
import { FOLLOWERS_COUNT, FOLLOW_PLACES } from '@C/profile/followers-count/const';
import { useGetFollowersByUserIdQuery, useGetFriendsByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

export default function UsersCounter(variant: FOLLOW_PLACES) {
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();
  const { push } = useRouter();
  const { dark } = useTheme();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const whosId = friendId ? `${friendId}` : `${user?.id}`;
  const place = pathname.includes(ROUTES.home) ? ROUTES.home : ROUTES.profile;
  const {
    isLoading,
    isError,
    error,
    data: whoFollowsUserList,
  } = useGetFollowersByUserIdQuery(whosId, { skip: variant === FOLLOW_PLACES.whoFollowsUser });
  const {
    isLoading: isFollowingsLoading,
    error: followingsError,
    isError: isFollowingsError,
    data: whoUserFollowsList,
  } = useGetFriendsByUserIdQuery(whosId, { skip: variant === FOLLOW_PLACES.whoUserFollows });

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${place}/${ROUTES.followers}/${whosId}`)}
      disabled={isError || isLoading}
      borderless
      style={{ borderRadius: 10 }}>
      <>
        <Text variant="bodySmall">
          {isError ? `${FOLLOWERS_COUNT[language].error}:` : FOLLOWERS_COUNT[language].followers}
        </Text>
        <Text variant="titleLarge">
          {(isLoading || isFollowingsLoading) && ' '}
          {whoFollowsUserList?.length && `${whoFollowsUserList?.length}`}
          {whoUserFollowsList?.length && `${whoUserFollowsList?.length}`}
          {isFollowingsError && `${errorExtracter(followingsError)}`}
          {isError && `${errorExtracter(error)}`}
        </Text>
      </>
    </TouchableRipple>
  );
}
