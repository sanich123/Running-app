import { useAuth } from '@A/context/auth-context';
import { useGetFollowersByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { FOLLOWERS_COUNT } from './const';

export default function FollowersCount() {
  const { user } = useAuth();
  const { push } = useRouter();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const { language } = useAppSelector(({ language }) => language);
  const {
    isLoading,
    isError,
    error,
    data: followers,
  } = useGetFollowersByUserIdQuery(friendId ? `${friendId}` : `${user?.id}`);

  return (
    <Pressable
      onPress={() =>
        push(`/${pathname.includes(ROUTES.home) ? ROUTES.home : ROUTES.profile}/${ROUTES.followers}/${friendId}`)
      }
      disabled={isError || isLoading}
      style={({ pressed }) => ({ opacity: pressed || isError || isLoading ? 0.5 : 1 })}>
      <Text variant="bodySmall">
        {isError ? `${FOLLOWERS_COUNT[language].error}:` : FOLLOWERS_COUNT[language].followers}
      </Text>
      {isLoading && <ActivityIndicator size="small" />}
      {!isLoading && <Text variant="titleLarge">{isError ? `${errorExtracter(error)}` : `${followers?.length}`}</Text>}
    </Pressable>
  );
}
