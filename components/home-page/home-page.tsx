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
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery } from '@R/services/activity/activity';
import { useRouter } from 'expo-router';

export default function Feed() {
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);
  const { data, error, isLoading, refetch, fetchNextPage, isFetching, isSuccess, isError } =
    useGetActivitiesByUserIdWithFriendsActivitiesInfiniteQuery(
      {
        id: userId,
      },
      { skip: !userId },
    );

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, justifyContent: 'center' }}>
      <BottomSheetModalProvider>
        <>
          {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
          {isLoading ? <ActivityIndicator size="large" testID="homeActivityIndicator" /> : null}
          {isError ? <ErrorComponent error={error} refetch={refetch} /> : null}
          {isSuccess && (
            <>
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
        </>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
}
