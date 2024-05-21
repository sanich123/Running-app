import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';
import OptimizedList from '@C/flash-list/flash-list';
import FloatingBtn from '@C/floating-btn/floating-btn';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import {
  setIsManualAdding,
  resetFinishedActivity,
  resetManualData,
  resetActivityInfo,
  setIsEditingActivity,
} from '@R/activity/activity';
import { useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Feed() {
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);
  const [page, setPage] = useState(0);

  const {
    data: activities,
    error,
    isLoading,
    refetch,
  } = useGetActivitiesByUserIdWithFriendsActivitiesQuery({ id: `${user?.id}`, page, take: 10 }, { skip: !user });

  return (
    <SafeAreaView edges={['left', 'right']} style={[{ flex: 1, justifyContent: 'center' }]}>
      {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
      {isLoading && <ActivityIndicator size="large" testID="homeActivityIndicator" />}
      {error ? <ErrorComponent error={error} /> : null}
      {activities?.length && <OptimizedList data={activities} page={page} setPage={setPage} refetch={refetch} />}
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
    </SafeAreaView>
  );
}
