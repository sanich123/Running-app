import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { useGetActivitiesByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import InfiniteScrollList from '@S/infinite-scroll-list/infinite-scroll-list';

export default function Activities() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data, isLoading, error, isError, refetch, isSuccess, fetchNextPage, isFetching } =
    useGetActivitiesByUserIdInfiniteQuery({ id: userId }, { skip: !userId });
  const { language } = useAppSelector(({ settings }) => settings);
  const activities = useMemo(() => data?.pages.flatMap(({ activities }) => activities) ?? [], [data?.pages]);

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="userProfilePageActivityIndicator" />
      ) : isSuccess ? (
        activities.length ? (
          <InfiniteScrollList
            dataToRender={activities}
            refetch={refetch}
            isLastPage={!data?.pages[data?.pages.length - 1]?.hasMore}
            nextPageCallback={fetchNextPage}
            isFetching={isFetching}
          />
        ) : (
          <EmptyState
            icon="run-fast"
            title={EMPTY_STATE_COPY[language].activities.title}
            message={EMPTY_STATE_COPY[language].activities.message}
          />
        )
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
