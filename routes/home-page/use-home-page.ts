import { useEffect, useMemo } from 'react';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useGetHomeActivityFeedsInfiniteQuery } from '@R/services/activity/activity';
import { useGetAppConfigQuery } from '@R/services/authentication/authentication';
import { useAppSelector } from '@R/typed-hooks';
import { isAppVersionOutdated } from '@U/is-app-version-outdated';
import type { HomeFeed } from './const';

export default function useHomePage(activeFeed: HomeFeed) {
  const { replace } = useRouter();
  const { accessToken, userId } = useAppSelector(({ auth }) => auth);
  const { data, error, isLoading, isFetching, isSuccess, refetch, fetchNextPage, isFetchingNextPage, isError } =
    useGetHomeActivityFeedsInfiniteQuery(undefined, { skip: !userId, refetchOnFocus: true });
  const { data: appConfig } = useGetAppConfigQuery(undefined, { skip: !accessToken });
  const activities = useMemo(
    () => data?.pages.flatMap((page) => page[activeFeed].activities) ?? [],
    [activeFeed, data?.pages],
  );
  const activeFeedPage = data?.pages.at(-1)?.[activeFeed];

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
    isLastPage: !(activeFeedPage?.hasMore ?? false),
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    isError,
  };
}
