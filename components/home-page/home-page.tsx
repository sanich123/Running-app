import { useAuth } from '@A/context/auth-context';
import ErrorComponent from '@C/error-component/error-component';
import OptimizedList from '@C/flash-list/flash-list';
import FloatingBtn from '@C/floating-btn/floating-btn';
import NetworkIndicator from '@C/network-indicator/network-indicator';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import {
  setIsManualAdding,
  resetFinishedActivity,
  resetManualData,
  resetActivityInfo,
  setIsEditingActivity,
} from '@R/activity/activity';
import { runichApi, useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import useGetPermissions from '@U/hooks/use-get-permission';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
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
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const prefetchUsers = runichApi.usePrefetch('getUsers');

  useEffect(() => {
    if (isNeedToPrefetchActivities && !process.env.IS_TESTING) {
      prefetchUsers('');
    }
  }, [isNeedToPrefetchActivities]);

  return (
    <>
      {Platform.OS === 'web' ? (
        <OptimizedList activities={activities} refetch={refetch} />
      ) : (
        <SafeAreaView
          edges={['left', 'right']}
          style={[{ flex: 1 }, (isLoading || error || !activities?.length) && { justifyContent: 'center' }]}>
          <View>
            {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
            {!isLoading && <NetworkIndicator />}
            {activities && <OptimizedList activities={activities} refetch={refetch} />}
            {isLoading && <ActivityIndicator size="large" testID="homeActivityIndicator" />}
            {error ? <ErrorComponent error={error} /> : null}
            {!isLoading && (
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
            )}
          </View>
        </SafeAreaView>
      )}
    </>
  );
}
