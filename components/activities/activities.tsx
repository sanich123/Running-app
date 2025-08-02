import ErrorComponent from '@C/error-component/error-component';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';
import { useGetActivitiesByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityIndicator } from 'react-native-paper';

export default function Activities() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data, isLoading, error, isError, refetch, isSuccess, fetchNextPage, isFetching } =
    useGetActivitiesByUserIdInfiniteQuery({ id: userId }, { skip: !userId });

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isSuccess && (
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
      )}
      {isLoading && <ActivityIndicator size="large" testID="userProfilePageActivityIndicator" />}
      {isError && <ErrorComponent error={error} refetch={refetch} />}
    </CrossPlatformLayout>
  );
}
