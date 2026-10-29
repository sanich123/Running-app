import { HOME_FEED } from '@Routes/home-page/const';
import EmptyActivitiesList from '@Routes/home-page/empty-activities-list/empty-activities-list';
import HomeFeedError from '@Routes/home-page/home-feed-error/home-feed-error';
import HomeFeedSkeleton from '@Routes/home-page/home-feed-skeleton/home-feed-skeleton';
import useHomePage from '@Routes/home-page/use-home-page';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import InfiniteScrollList from '@S/infinite-scroll-list/infinite-scroll-list';

export default function FavoriteActivitiesPage() {
  const {
    activities,
    error,
    isFeedLoading,
    hasLoadedActivities,
    isLastPage,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
  } = useHomePage(HOME_FEED.favorites);

  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled={activities.length === 0} refetch={refetch}>
      {isFeedLoading ? (
        <HomeFeedSkeleton />
      ) : hasLoadedActivities ? (
        activities.length > 0 ? (
          <InfiniteScrollList
            dataToRender={activities}
            refetch={refetch}
            isLastPage={isLastPage}
            nextPageCallback={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        ) : (
          <EmptyActivitiesList />
        )
      ) : error ? (
        <HomeFeedError error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
