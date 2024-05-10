import { useAuth } from '@A/context/auth-context';
import { useGetFriendsByUserIdQuery } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { ROUTES } from '@const/enums';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { FOLLOWING_COUNT } from './const';

export default function FollowingCount() {
  const { language } = useAppSelector(({ language }) => language);
  const { user } = useAuth();
  const { push } = useRouter();
  const { dark } = useTheme();
  const pathname = usePathname();
  const { id: friendId } = useLocalSearchParams();
  const whosId = friendId ? `${friendId}` : `${user?.id}`;
  const place = pathname.includes(ROUTES.home) ? ROUTES.home : ROUTES.profile;
  const { isLoading, error, isError, data: listOfFriends } = useGetFriendsByUserIdQuery(whosId);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${place}/${ROUTES.following}/${whosId}`)}
      disabled={isError || isLoading}
      borderless
      style={{ borderRadius: 10 }}>
      <>
        <Text variant="bodySmall">
          {isError ? `${FOLLOWING_COUNT[language].error}:` : FOLLOWING_COUNT[language].followings}
        </Text>
        <Text variant="titleLarge">
          {isLoading && ' '}
          {listOfFriends?.length && `${listOfFriends?.length}`}
          {isError && `${errorExtracter(error)}`}
        </Text>
      </>
    </TouchableRipple>
  );
}
