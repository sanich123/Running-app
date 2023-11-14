import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import ActivityCard from '../../../components/card/card';
import EmptyActivitiesList from '../../../components/empty-activities-list/empty-activities-list';
import ErrorComponent from '../../../components/error-component/error-component';
import FloatingBtn from '../../../components/floating-btn/floating-btn';
import UnsendedActivitiesIndicator from '../../../components/unsended-activities/unsended-activities-indicator';
import { runichApi, useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '../../../redux/runich-api/runich-api';
import useGetPermissions from '../../../utils/hooks/use-get-permission';
import useRefresh from '../../../utils/hooks/use-refresh';

export default function Feed() {
  const { user } = useAuth();
  const { push } = useRouter();
  const dispatch = useDispatch();
  useGetPermissions();
  const {
    data: activities,
    error,
    isLoading,
    refetch,
  } = useGetActivitiesByUserIdWithFriendsActivitiesQuery(user.id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { onRefresh, refreshing } = useRefresh(refetch);
  const { isHaveUnsyncedActivity } = useSelector(({ activity }) => activity);

  useEffect(() => {
    if (error) {
      dispatch(runichApi.util.resetApiState());
    }
  }, []);

  return (
    <>
      <SafeAreaView style={[{ flex: 1 }, (isLoading || error) && { alignItems: 'center', justifyContent: 'center' }]}>
        {isHaveUnsyncedActivity && <UnsendedActivitiesIndicator />}
        {activities && (
          <FlatList
            onRefresh={onRefresh}
            data={activities}
            refreshing={refreshing}
            renderItem={({ item }) => {
              const { description, title, date, sport, locations, photoUrls, duration, distance, id, user_id } = item;
              return (
                <ActivityCard
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
                />
              );
            }}
            contentContainerStyle={
              activities?.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' }
            }
            ListEmptyComponent={<EmptyActivitiesList />}
            initialNumToRender={5}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        {isLoading && <ActivityIndicator size="large" testID="homeActivityIndicator" />}
        {error ? <ErrorComponent error={error} refetchFn={refetch} /> : null}
        <FloatingBtn onPressFn={() => push('/save-activity/')} />
      </SafeAreaView>
    </>
  );
}
