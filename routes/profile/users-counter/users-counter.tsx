import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetFollowersByUserIdQuery, useGetYouFollowUsersByUserIdQuery } from '@R/services/followers/followers';
import { useAppSelector } from '@R/typed-hooks';
import Skeleton from '@S/skeleton/skeleton';
import { USERS_COUNT, USERS_VARIANT } from './const';

export default function UsersCounter({ variant, isHidden = false }: { variant: USERS_VARIANT; isHidden?: boolean }) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { push } = useRouter();
  const { id: friendId } = useLocalSearchParams();
  const whosId = friendId ? `${friendId}` : userId;
  const whereToPush = variant === USERS_VARIANT.whoUserFollows ? ROUTES.following : ROUTES.followers;
  const whatTitleToRender =
    variant === USERS_VARIANT.whoUserFollows ? USERS_COUNT[language].followings : USERS_COUNT[language].followers;
  const {
    isLoading: isFollowersLoading,
    isError: isFollowersError,
    data: whoFollowsUserList,
  } = useGetFollowersByUserIdQuery(whosId, { skip: isHidden || variant === USERS_VARIANT.whoUserFollows });

  const {
    isLoading: isFollowingsLoading,
    isError: isFollowingsError,
    data: whoUserFollowsList,
  } = useGetYouFollowUsersByUserIdQuery(whosId, { skip: isHidden || variant === USERS_VARIANT.whoFollowsUser });
  if (isHidden) return null;
  if (isFollowersError || isFollowingsError) {
    return null;
  }

  const isLoading = isFollowersLoading || isFollowingsLoading;

  return (
    <TouchableRipple
      onPress={() => push(`/${whereToPush}/${whosId}`)}
      disabled={isFollowersError || isLoading || isFollowingsError}
      borderless
      style={[styles.card, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}>
      <View style={styles.cardContent}>
        {isLoading ? (
          <>
            <Skeleton testID={`users-counter-${variant}-loading`} style={styles.titleSkeleton} />
            <Skeleton style={styles.valueSkeleton} />
          </>
        ) : (
          <>
            <Text variant="labelSmall">{whatTitleToRender}</Text>
            <Text variant="titleMedium" style={{ fontFamily: FONT_FAMILIES.extraBold }}>
              {whoFollowsUserList?.length && `${whoFollowsUserList?.length}`}
              {whoUserFollowsList?.length && `${whoUserFollowsList?.length}`}
            </Text>
          </>
        )}
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  titleSkeleton: { width: 68, height: 13 },
  valueSkeleton: { width: 40, height: 22, marginTop: 4 },
});
