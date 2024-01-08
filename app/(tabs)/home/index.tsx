import { useAuth } from '@A/context/auth-context';
import ActivityCard from '@C/card/card';
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
import { useRouter } from 'expo-router';
import { SafeAreaView, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';

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
      <SafeAreaView style={[{ flex: 1 }, (isLoading || error) && styles.isInCenter]}>
        {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
        <NetworkIndicator />
        {activities && (
          <FlatList
            onRefresh={onRefresh}
            data={activities}
            refreshing={refreshing}
            renderItem={({ item }) => {
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
                  key={id}
                  photoUrls={photoUrls}
                  duration={duration}
                  distance={distance}
                  fullViewRef={{ current: null }}
                />
              );
            }}
            contentContainerStyle={activities?.length === 0 && styles.isInCenter}
            ListEmptyComponent={<EmptyActivitiesList />}
            initialNumToRender={5}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
