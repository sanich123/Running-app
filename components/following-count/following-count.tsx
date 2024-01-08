import { useAuth } from '@A/context/auth-context';
import { useGetFriendsByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { FOLLOWING_COUNT } from './const';

export default function FollowingCount() {
  const { user } = useAuth();
  const { push } = useRouter();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const { language } = useAppSelector(({ language }) => language);
  const {
    isLoading,
    error,
    isError,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery(friendId ? `${friendId}` : `${user?.id}`);

  return (
    <Pressable
      onPress={() =>
        push(
          `/${pathname.includes(ROUTES.home) ? ROUTES.home : ROUTES.profile}/${ROUTES.following}/${
            friendId ? friendId : user?.id
          }`,
        )
      }
      disabled={isError || isLoading}
      style={(isError || isLoading) && { opacity: 0.5 }}>
      <Text variant="bodySmall">
        {isError ? `${FOLLOWING_COUNT[language].error}:` : FOLLOWING_COUNT[language].followings}
      </Text>
      {isLoading && <ActivityIndicator size="small" />}
      {!isLoading && (
        <Text variant="titleLarge">{isError ? `${errorExtracter(error)}` : `${listOfFriends?.length}`}</Text>
      )}
    </Pressable>
  );
}
