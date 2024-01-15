import { useAuth } from '@A/context/auth-context';
import ActivityCard from '@C/card/card';
import { ActivityCardProps } from '@C/card/const ';
import EmptyActivitiesList from '@C/empty-activities-list/empty-activities-list';
import ErrorComponent from '@C/error-component/error-component';
import FloatingBtn from '@C/floating-btn/floating-btn';
import NetworkIndicator from '@C/network-indicator/network-indicator';
import UnsendedActivitiesIndicator from '@C/unsended-activities/unsended-activities-indicator';
import { setIsManualAdding, resetFinishedActivity, resetManualData } from '@R/activity/activity';
import { useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import useGetPermissions from '@U/hooks/use-get-permission';
import useRefresh from '@U/hooks/use-refresh';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';
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
  const { onRefresh, refreshing } = useRefresh(refetch);
  const { isHaveUnsyncedActivity } = useAppSelector(({ activity }) => activity);

  return (
    <>
      <SafeAreaView
        edges={['left', 'right']}
        style={[{ flex: 1 }, (isLoading || error || activities?.length === 0) && styles.isInCenter]}>
        {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
        <NetworkIndicator />
        {activities && (
          <FlashList
            onRefresh={onRefresh}
            data={activities}
            refreshing={refreshing}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: ActivityCardProps & { user_id: string } }) => {
              const { description, title, date, sport, locations, photoUrls, duration, distance, id, user_id } = item;
              return (
                <ActivityCard
                  isShowDeleteBtn={false}
                  isShowDescription={false}
                  description={description}
                  title={title}
                  date={date}
                  sport={sport}
                  userId={user_id}
                  id={id}
                  locations={locations}
                  photoUrls={photoUrls}
                  duration={duration}
                  distance={distance}
                  fullViewRef={{ current: null }}
                />
              );
            }}
            estimatedItemSize={200}
            ListEmptyComponent={<EmptyActivitiesList />}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
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
