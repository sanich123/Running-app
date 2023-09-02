import { useState, useCallback } from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import { Text, ActivityIndicator, Divider, FAB, Searchbar } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { View } from '../../../components/Themed';
import ActivityCard from '../../../components/activity-card/activity-card';
import EmptyActivitiesList from '../../../components/empty-activities-list/empty-activities-list';
import { useGetActivitiesByUserIdQuery } from '../../../redux/runnich-api/runnich-api';
import useGetLocation from '../../../utils/hooks/use-get-location';

export default function Feed() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  useGetLocation();
  const { data: activities, error, isLoading, refetch } = useGetActivitiesByUserIdQuery(id);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 2000);
  }, []);
  console.log(activities);
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        {activities && (
          <FlatList
            onRefresh={onRefresh}
            data={activities}
            refreshing={refreshing}
            renderItem={({ item }) => {
              const { description, title, date, sport, id, locations, photoUrl, duration, speed } = item;
              return (
                <ActivityCard
                  description={description}
                  title={title}
                  date={date}
                  sport={sport}
                  id={id}
                  locations={locations}
                  key={id}
                  photoUrl={photoUrl}
                  duration={duration}
                  speed={speed}
                />
              );
            }}
            ListEmptyComponent={<EmptyActivitiesList />}
            ListHeaderComponent={<Searchbar placeholder="Search something" value="" />}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        {isLoading && <ActivityIndicator />}
        {error && (
          <View>
            <Text>An error occured</Text>
          </View>
        )}
        <FAB
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 40,
          }}
          onPress={() => console.log('Pressed')}
        />
      </SafeAreaView>
    </>
  );
}
