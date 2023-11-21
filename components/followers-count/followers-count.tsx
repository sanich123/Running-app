import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { FOLLOWERS_COUNT } from './const';
import { useAuth } from '../../auth/context/auth-context';
import { useGetFollowersByUserIdQuery } from '../../redux/runich-api/runich-api';
import { errorExtracter } from '../../utils/error-handler';

export default function FollowersCount() {
  const { user } = useAuth();
  const { push } = useRouter();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const { isLoading, isError, error, data: followers } = useGetFollowersByUserIdQuery((friendId as string) ?? user.id);
  const { language } = useSelector(({ language }) => language);

  return (
    <Pressable
      onPress={() => push(`/${pathname.includes('home') ? 'home' : 'profile'}/followers/${friendId}`)}
      disabled={isError || isLoading}
      style={(isError || isLoading) && { opacity: 0.5 }}>
      <Text variant="bodySmall">
        {isError ? `${FOLLOWERS_COUNT[language].error}:` : FOLLOWERS_COUNT[language].followers}
      </Text>
      {isLoading && <ActivityIndicator size="small" />}
      {!isLoading && <Text variant="titleLarge">{isError ? `${errorExtracter(error)}` : `${followers?.length}`}</Text>}
    </Pressable>
  );
}
