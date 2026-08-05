import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';
import ErrorComponent from '@C/error-component/error-component';
import FloatingBtn from '@C/floating-btn/floating-btn';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import CrossPlatformLayout from '@C/shared/cross-platform-layout/cross-platform-layout';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import { useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery } from '@R/services/activity/activity';
import { resetAdditionaInfoActivitySlice } from '@R/slices/actitivity-additional-info/activity-additional-info';
import { resetFinishedActivity } from '@R/slices/activity/activity';
import { resetManualActivitySlice, setIsManualAdding } from '@R/slices/manual-activity/manual-activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';

export default function Feed() {
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isHaveUnsyncedActivity } = useAppSelector(({ unsendedActivity }) => unsendedActivity);
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
          {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
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
                  push('/(protected)/manual-activity');
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
