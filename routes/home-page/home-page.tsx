import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery } from '@R/services/activity/activity';
import { resetAdditionaInfoActivitySlice } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { resetFinishedActivity } from '@R/slices/activity/activity';
import { resetManualActivitySlice, setIsManualAdding } from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import EmptyActivitiesList from '@Routes/empty-activities-list/empty-activities-list';
import ErrorComponent from '@Routes/error-component/error-component';
import FloatingBtn from '@Routes/floating-btn/floating-btn';
import InfiniteScrollList from '@Routes/infinite-scroll-list/infinite-scroll-list';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';

export default function Feed() {
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data, error, isLoading, isSuccess, refetch, fetchNextPage, isFetching, isError } =
    useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery(
      {
        id: userId,
      },
      { skip: !userId },
    );
  const activities = data?.pages
    .flat()
    .map(({ activities }) => activities)
    .flat();
  const lastPage = data?.pages
    .flat()
    .map(({ isLastPage }) => isLastPage)
    .flat();

  return (
    <CrossPlatformLayout edges={[]} isLoading={isLoading} isError={isError}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="homeActivityIndicator" />
      ) : isSuccess ? (
        <>
          {activities && activities?.length > 0 && (
            <>
              <InfiniteScrollList
                dataToRender={activities}
                refetch={refetch}
                isLastPage={!!lastPage?.[lastPage.length - 1]}
                nextPageCallback={fetchNextPage}
                isFetching={isFetching}
              />
              <FloatingBtn
                onPressFn={() => {
                  dispatch(resetManualActivitySlice());
                  dispatch(resetAdditionaInfoActivitySlice());
                  dispatch(resetFinishedActivity());
                  dispatch(setIsManualAdding(true));
                  push(`/${ROUTES.manualActivity}`);
                }}
              />
            </>
          )}
          {!activities?.length && <EmptyActivitiesList />}
        </>
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </CrossPlatformLayout>
  );
}
