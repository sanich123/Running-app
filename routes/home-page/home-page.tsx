import { useEffect, useMemo, useState } from 'react';
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
import EmptyActivitiesList from '@Routes/home-page/empty-activities-list/empty-activities-list';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import InfiniteScrollList from '@S/infinite-scroll-list/infinite-scroll-list';
import WeekStatistics from '@S/infinite-scroll-list/week-statistics/week-statistics';
import { isAppVersionOutdated } from '@U/is-app-version-outdated';
import { HOME_FEED, HOME_FEED_COPY, type HomeFeed } from './const';
import HomeFeedError from './home-feed-error';
import HomeFeedSkeleton from './home-feed-skeleton';
import HomeFeedSwitcher from './home-feed-switcher';

export default function Feed() {
  const { replace } = useRouter();
  const { accessToken, userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const [activeFeed, setActiveFeed] = useState<HomeFeed>(HOME_FEED.followers);
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
  const isFeedLoading = isLoading || (isFetching && activities.length === 0);
  const hasLoadedActivities = isSuccess || activities.length > 0;
  const isLastPage = !(data?.pages.at(-1)?.hasMore ?? false);
  const feedLabels = HOME_FEED_COPY[language];
  const feedSwitcher = <HomeFeedSwitcher value={activeFeed} labels={feedLabels} onValueChange={setActiveFeed} />;

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
    if (appConfig?.appVersion && isAppVersionOutdated(currentVersion, appConfig.appVersion)) {
      replace(`/${ROUTES.updateApp}`);
    }
  }, [appConfig?.appVersion, replace]);

  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled={activities.length === 0} refetch={refetch}>
      {isFeedLoading ? (
        <>
          <WeekStatistics />
          {feedSwitcher}
          <HomeFeedSkeleton />
        </>
      ) : hasLoadedActivities ? (
        <>
          {activities && activities?.length > 0 && (
            <InfiniteScrollList
              dataToRender={activities}
              refetch={refetch}
              isLastPage={isLastPage}
              nextPageCallback={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
              headerAfterWeekStatistics={feedSwitcher}
            />
          )}
          {!activities?.length && (
            <>
              <WeekStatistics />
              {feedSwitcher}
              <EmptyActivitiesList />
            </>
          )}
        </>
      ) : isError ? (
        <>
          <WeekStatistics />
          {feedSwitcher}
          <HomeFeedError error={error} refetch={refetch} />
        </>
      ) : null}
    </CrossPlatformLayout>
  );
}
