import ErrorComponent from '@C/error-component/error-component';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useGetActivitiesByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Activities() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data, isLoading, error, isError, refetch, isSuccess, fetchNextPage, isFetching } =
    useGetActivitiesByUserIdInfiniteQuery({ id: userId }, { skip: !userId });

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[{ flex: 1, justifyContent: 'center' }, (isLoading || isError) && { justifyContent: 'center' }]}>
      <BottomSheetModalProvider>
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
      </BottomSheetModalProvider>
      {isLoading && <ActivityIndicator size="large" testID="userProfilePageActivityIndicator" />}
      {isError && <ErrorComponent error={error} refetch={refetch} />}
    </SafeAreaView>
  );
}
