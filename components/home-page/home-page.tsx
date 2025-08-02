import ErrorComponent from '@C/error-component/error-component';
import FloatingBtn from '@C/floating-btn/floating-btn';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import {
  setIsManualAdding,
  resetFinishedActivity,
  resetManualData,
  resetActivityInfo,
  setIsEditingActivity,
} from '@R/slices/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery } from '@R/services/activity/activity';
import { useRouter } from 'expo-router';
import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';

export default function Feed() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);
  const { data, error, isLoading, refetch, fetchNextPage, isFetching, isError } =
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
    <SafeAreaView
      edges={[]}
      style={[
        { flex: 1, backgroundColor: colors.background },
        (isLoading || isError || !activities?.length) && {
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}>
      <>
        {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
        {isLoading ? <ActivityIndicator size="large" testID="homeActivityIndicator" /> : null}
        {isError ? <ErrorComponent error={error} refetch={refetch} /> : null}
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
                dispatch(setIsManualAdding(true));
                dispatch(setIsEditingActivity(false));
                dispatch(resetFinishedActivity());
                dispatch(resetManualData());
                dispatch(resetActivityInfo());
                push('/(protected)/manual-activity');
              }}
            />
          </>
        )}
        {!activities?.length && <EmptyActivitiesList />}
      </>
    </SafeAreaView>
  );
}
