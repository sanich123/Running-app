import { useAuth } from '@A/context/auth-context';
import { useGetFriendsByUserIdQuery } from '@R/runich-api/runich-api';
import { errorExtracter } from '@U/error-handler';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { FOLLOWING_COUNT } from './const';

export default function FollowingCount() {
  const { user } = useAuth();
  const { push } = useRouter();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const {
    isLoading,
    error,
    isError,
    data: listOfFriends,
  } = useGetFriendsByUserIdQuery((friendId as string) ?? user.id);
  const { language } = useSelector(({ language }) => language);

  return (
    <Pressable
      onPress={() => push(`/${pathname.includes('home') ? 'home' : 'profile'}/following/${friendId}`)}
      disabled={isError || isLoading}
      style={(isError || isLoading) && { opacity: 0.5 }}>
      <Text variant="bodySmall">
        {isError
          ? `${FOLLOWING_COUNT[language as keyof typeof FOLLOWING_COUNT].error}:`
          : FOLLOWING_COUNT[language as keyof typeof FOLLOWING_COUNT].followings}
      </Text>
      {isLoading && <ActivityIndicator size="small" />}
      {!isLoading && (
        <Text variant="titleLarge">{isError ? `${errorExtracter(error)}` : `${listOfFriends?.length}`}</Text>
      )}
    </Pressable>
  );
}
