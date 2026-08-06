import { ActivityIndicator } from 'react-native-paper';
import { useGetActivitiesByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@Routes/error-component/error-component';
import InfiniteScrollList from '@Routes/infinite-scroll-list/infinite-scroll-list';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';

export default function Activities() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data, isLoading, error, isError, refetch, isSuccess, fetchNextPage, isFetching } =
    useGetActivitiesByUserIdInfiniteQuery({ id: userId }, { skip: !userId });

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="userProfilePageActivityIndicator" />
      ) : isSuccess ? (
        <InfiniteScrollList
          dataToRender={data?.pages
            .flat()
            .map(({ activities }) => activities)
            .flat()}
          refetch={refetch}
          isLastPage={data?.pages[data?.pages.length - 1]?.isLastPage}
          nextPageCallback={fetchNextPage}
          isFetching={isFetching}
        />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
