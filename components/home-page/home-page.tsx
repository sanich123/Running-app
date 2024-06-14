import { useAuth } from '@A/context/auth-context';
import { ProfileType } from '@C/card/const ';
import ErrorComponent from '@C/error-component/error-component';
import FloatingBtn from '@C/floating-btn/floating-btn';
import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import UserListItem from '@C/user-list-item/user-list-item';
import {
  setIsManualAdding,
  resetFinishedActivity,
  resetManualData,
  resetActivityInfo,
  setIsEditingActivity,
} from '@R/activity/activity';
import { setIsNeedToRefreshActivities } from '@R/main-feed/main-feed';
import {
  runichApi,
  useGetActivitiesByUserIdWithFriendsActivitiesQuery,
  useGetLikesByActivityIdQuery,
} from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ModalLikesListContext } from '@U/context/activity-card-btns';
import { BottomSheetFlatList, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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
  const { activityIdWhichLikesToDownload } = useAppSelector(({ mainFeed }) => mainFeed);
  const { data: likes } = useGetLikesByActivityIdQuery(`${activityIdWhichLikesToDownload}`);

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, justifyContent: 'center' }}>
      <ModalLikesListContext.Provider value={{ modalRef: bottomSheetModalRef }}>
        <BottomSheetModalProvider>
          <>
            <BottomSheetModal
              ref={bottomSheetModalRef}
              index={likes?.length < 3 ? 0 : 1}
              snapPoints={['25%', '50%', '75%']}>
              <BottomSheetFlatList
                data={likes}
                renderItem={({ item: { profile } }: { item: { profile: ProfileType } }) => (
                  <UserListItem
                    name={profile?.name}
                    surname={profile?.surname}
                    profilePhoto={profile?.profilePhoto}
                    placeholder={profile?.profilePhotoBlurhash}
                    city={profile?.city}
                    user_id={profile?.user_id}
                  />
                )}
              />
            </BottomSheetModal>
            {isHaveUnsyncedActivity ? <UnsendedActivitiesIndicator /> : null}
            {isLoading ? <ActivityIndicator size="large" testID="homeActivityIndicator" /> : null}
            {error || data?.message ? <ErrorComponent error={error || data} refetch={refetch} /> : null}
            {!data?.message && data?.activities?.length ? (
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
                    push('/(tabs)/home/manual-activity');
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
