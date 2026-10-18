import { useEffect, useMemo } from 'react';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import {
  useGetActivitiesByUserIdInfiniteQuery,
  useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery,
  useGetFavoriteActivitiesInfiniteQuery,
} from '@R/services/activity/activity';
import { useGetAppConfigQuery } from '@R/services/authentication/authentication';
import { useAppSelector } from '@R/typed-hooks';
import { isAppVersionOutdated } from '@U/is-app-version-outdated';
import { HOME_FEED } from './const';
import type { HomeFeed } from './const';

export default function useHomePage(activeFeed: HomeFeed) {
  const { replace } = useRouter();
  const { accessToken, userId } = useAppSelector(({ auth }) => auth);
  const myActivitiesQuery = useGetActivitiesByUserIdInfiniteQuery(
    { id: userId },
    { skip: !userId || activeFeed !== HOME_FEED.my, refetchOnFocus: true },
  );
  const followersActivitiesQuery = useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery(
    { id: userId },
    { skip: !userId || activeFeed !== HOME_FEED.followers, refetchOnFocus: true },
  );
  const favoriteActivitiesQuery = useGetFavoriteActivitiesInfiniteQuery(undefined, {
    skip: !userId || activeFeed !== HOME_FEED.favorites,
    refetchOnFocus: true,
  });
  const activeActivitiesQuery =
    activeFeed === HOME_FEED.my
      ? myActivitiesQuery
      : activeFeed === HOME_FEED.favorites
        ? favoriteActivitiesQuery
        : followersActivitiesQuery;
  const { data, error, isLoading, isFetching, isSuccess, refetch, fetchNextPage, isFetchingNextPage, isError } =
    activeActivitiesQuery;
  const { data: appConfig } = useGetAppConfigQuery(undefined, { skip: !accessToken });
  const activities = useMemo(() => data?.pages.flatMap(({ activities }) => activities) ?? [], [data?.pages]);

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
    if (appConfig?.appVersion && isAppVersionOutdated(currentVersion, appConfig.appVersion)) {
      replace(`/${ROUTES.updateApp}`);
    }
  }, [appConfig?.appVersion, replace]);

  return {
    activities,
    error,
    isFeedLoading: isLoading || (isFetching && activities.length === 0),
    hasLoadedActivities: isSuccess || activities.length > 0,
    isLastPage: !(data?.pages.at(-1)?.hasMore ?? false),
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    isError,
  };
}
