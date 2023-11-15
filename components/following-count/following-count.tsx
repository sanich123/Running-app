import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { FOLLOWING_COUNT } from './const';
import { useAuth } from '../../auth/context/auth-context';
import { useGetFriendsByUserIdQuery } from '../../redux/runich-api/runich-api';
import { errorExtracter } from '../../utils/error-handler';

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
      style={(isLoading || isError) && { opacity: 0.5 }}>
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
