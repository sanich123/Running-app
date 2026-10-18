import { useState } from 'react';
import EmptyActivitiesList from '@Routes/home-page/empty-activities-list/empty-activities-list';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import InfiniteScrollList from '@S/infinite-scroll-list/infinite-scroll-list';
import WeekStatistics from '@S/infinite-scroll-list/week-statistics/week-statistics';
import { HOME_FEED, type HomeFeed } from './const';
import HomeFeedError from './home-feed-error/home-feed-error';
import HomeFeedSkeleton from './home-feed-skeleton/home-feed-skeleton';
import HomeFeedSwitcher from './home-feed-switcher/home-feed-switcher';
import useHomePage from './use-home-page';

export default function HomePage() {
  const [activeFeed, setActiveFeed] = useState<HomeFeed>(HOME_FEED.followers);
  const {
    activities,
    error,
    isFeedLoading,
    hasLoadedActivities,
    isLastPage,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
  } = useHomePage(activeFeed);
  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled={activities.length === 0} refetch={refetch}>
      {isFeedLoading ? (
        <>
          <WeekStatistics />
          <HomeFeedSwitcher value={activeFeed} onValueChange={setActiveFeed} />
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
              headerAfterWeekStatistics={<HomeFeedSwitcher value={activeFeed} onValueChange={setActiveFeed} />}
            />
          )}
          {!activities?.length && (
            <>
              <WeekStatistics />
              <HomeFeedSwitcher value={activeFeed} onValueChange={setActiveFeed} />
              <EmptyActivitiesList />
            </>
          )}
        </>
      ) : error ? (
        <>
          <WeekStatistics />
          <HomeFeedSwitcher value={activeFeed} onValueChange={setActiveFeed} />
          <HomeFeedError error={error} refetch={refetch} />
        </>
      ) : null}
    </CrossPlatformLayout>
  );
}
