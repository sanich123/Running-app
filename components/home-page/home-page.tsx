import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';
import FloatingBtn from '@C/floating-btn/floating-btn';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import ModalLikesList from '@C/modals/likes-list/modal-likes-list';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import {
  setIsManualAdding,
  resetFinishedActivity,
  resetManualData,
  resetActivityInfo,
  setIsEditingActivity,
} from '@R/activity/activity';
import { setIsNeedToRefreshActivities } from '@R/main-feed/main-feed';
import { runichApi, useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ModalLikesListContext } from '@U/context/activity-card-btns';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Feed() {
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);
  const { needToRefreshActivities } = useAppSelector(({ mainFeed }) => mainFeed);
  const [page, setPage] = useState(0);
  const { data, error, isLoading, refetch } = useGetActivitiesByUserIdWithFriendsActivitiesQuery(
    { id: `${user?.id}`, page, take: 10 },
    { skip: !user?.id },
  );
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  useFocusEffect(() => {
    if (needToRefreshActivities) {
      setPage(0);
      setTimeout(() => dispatch(runichApi.util.resetApiState()), 0);
      dispatch(setIsNeedToRefreshActivities(false));
    }
  });

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, justifyContent: 'center' }}>
      <ModalLikesListContext.Provider value={{ modalRef: bottomSheetModalRef }}>
        <BottomSheetModalProvider>
          <>
            <ModalLikesList bottomSheetModalRef={bottomSheetModalRef} />
            {isHaveUnsyncedActivity ? <UnsendedActivitiesIndicator /> : null}
            {isLoading ? <ActivityIndicator size="large" testID="homeActivityIndicator" /> : null}
            {error || data?.message ? <ErrorComponent error={error || data} refetch={refetch} /> : null}
            {!data?.message && data?.activities ? (
              <>
                <InfiniteScrollList
                  dataToRender={data?.activities}
                  page={page}
                  setPage={setPage}
                  refetch={refetch}
                  isLastPage={data?.isLastPage}
                />
                <FloatingBtn
                  onPressFn={() => {
                    dispatch(setIsManualAdding(true));
                    dispatch(setIsEditingActivity(false));
                    dispatch(resetFinishedActivity());
                    dispatch(resetManualData());
                    dispatch(resetActivityInfo());
                    push('/home/manual-activity');
                  }}
                />
              </>
            ) : null}
          </>
        </BottomSheetModalProvider>
      </ModalLikesListContext.Provider>
    </SafeAreaView>
  );
}
