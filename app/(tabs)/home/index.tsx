import { SafeAreaView, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { View } from '../../../components/Themed';
import ActivityCard from '../../../components/activity-card/activity-card';
import { useGetActivitiesByUserIdQuery } from '../../../redux/runnich-api/runnich-api';
import useGetLocation from '../../../utils/hooks/use-get-location';

export default function Feed() {
  const { id } = useSelector(({ userInfo }) => userInfo);
  useGetLocation();
  const {
    data: activities,
    error,
    isLoading,
    refetch,
  } = useGetActivitiesByUserIdQuery(id, { refetchOnReconnect: true, refetchOnMountOrArgChange: true });

  return (
    <>
      <SafeAreaView>
        {!activities.length && (
          <View>
            <Text variant="titleLarge">Здесь будут ваши тренировки (если сможете хоть одну записать)</Text>
          </View>
        )}
        {activities.length > 0 && (
          <FlatList
            onRefresh={() => refetch()}
            data={activities}
            refreshing
            renderItem={({ item }) => {
              const { description, title, date, sport, id, locations, photoUrl } = item;
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
                />
              );
            }}
          />
        )}
        {isLoading && <ActivityIndicator />}
        {error && (
          <View>
            <Text>An error occured</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
