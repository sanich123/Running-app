import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';
import OptimizedList from '@C/flash-list/flash-list';
import FloatingBtn from '@C/floating-btn/floating-btn';
import NetworkIndicator from '@C/network-indicator/network-indicator';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import { setIsManualAdding, resetFinishedActivity, resetManualData } from '@R/activity/activity';
import { runichApi, useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import useGetPermissions from '@U/hooks/use-get-permission';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Feed() {
  const { user } = useAuth();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  useGetPermissions();
  const {
    data: activities,
    error,
    isLoading,
    refetch,
  } = useGetActivitiesByUserIdWithFriendsActivitiesQuery(`${user?.id}`);
  const { isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);
  const prefetchUsers = runichApi.usePrefetch('getUsers');
  useEffect(() => {
    if (!process.env.IS_TESTING) {
      prefetchUsers('');
    }
  }, []);

  return (
    <>
      <SafeAreaView
        edges={['left', 'right']}
        style={[{ flex: 1 }, (isLoading || error || activities?.length === 0) && styles.isInCenter]}>
        {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
        <NetworkIndicator />
        {activities && <OptimizedList activities={activities} refetch={refetch} />}
        {isLoading && <ActivityIndicator size="large" testID="homeActivityIndicator" />}
        {error ? <ErrorComponent error={error} /> : null}
        <FloatingBtn
          onPressFn={() => {
            dispatch(setIsManualAdding(true));
            dispatch(resetFinishedActivity());
            dispatch(resetManualData());
            push('/(tabs)/home/manual-activity');
          }}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
