import { useState, useCallback } from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Searchbar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import ActivityCard from '../../../components/activity-card/activity-card';
import EmptyActivitiesList from '../../../components/empty-activities-list/empty-activities-list';
import ErrorComponent from '../../../components/error-component/error-component';
import FloatingBtn from '../../../components/floating-btn/floating-btn';
import { useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '../../../redux/runnich-api/runnich-api';
import useGetLocation from '../../../utils/hooks/use-get-location';

export default function Feed() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  useGetLocation();
  const { data: activities, error, isLoading, refetch } = useGetActivitiesByUserIdWithFriendsActivitiesQuery(id);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <>
      <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
        {activities && (
          <FlatList
            onRefresh={onRefresh}
            data={activities}
            refreshing={refreshing}
            renderItem={({ item }) => {
              const { description, title, date, sport, userId, locations, photoUrl, duration, speed, distance, id } =
                item;
              return (
                <ActivityCard
                  description={description}
                  title={title}
                  date={date}
                  sport={sport}
                  userId={userId}
                  id={id}
                  locations={locations}
                  key={id}
                  photoUrl={photoUrl}
                  duration={duration}
                  speed={speed}
                  distance={distance}
                />
              );
            }}
            ListEmptyComponent={<EmptyActivitiesList />}
            ListHeaderComponent={<Searchbar placeholder="Search something" value="" />}
            initialNumToRender={2}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        <FloatingBtn onPressFn={console.log} />
      </SafeAreaView>
    </>
  );
}
