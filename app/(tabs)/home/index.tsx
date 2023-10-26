import { useRouter } from 'expo-router';
import { SafeAreaView, FlatList } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

import { useAuth } from '../../../auth/context/auth-context';
import ActivityCard from '../../../components/card/card';
import EmptyActivitiesList from '../../../components/empty-activities-list/empty-activities-list';
import ErrorComponent from '../../../components/error-component/error-component';
import FloatingBtn from '../../../components/floating-btn/floating-btn';
import { useGetActivitiesByUserIdWithFriendsActivitiesQuery } from '../../../redux/runich-api/runich-api';
import useGetPermissions from '../../../utils/hooks/use-get-permission';
import useRefresh from '../../../utils/hooks/use-refresh';

export default function Feed() {
  const { user } = useAuth();
  const router = useRouter();
  useGetPermissions();
  const { data: activities, error, isLoading, refetch } = useGetActivitiesByUserIdWithFriendsActivitiesQuery(user.id);
  const { onRefresh, refreshing } = useRefresh(refetch);

  return (
    <>
      <SafeAreaView
        style={[{ flex: 1 }, (isLoading || !activities?.length) && { alignItems: 'center', justifyContent: 'center' }]}>
        <Text variant="headlineMedium">Text with updates!</Text>
        {activities && (
          <FlatList
            onRefresh={onRefresh}
            data={activities}
            refreshing={refreshing}
            renderItem={({ item }) => {
              const { description, title, date, sport, locations, photoUrls, duration, speed, distance, id, user_id } =
                item;
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
                  speed={speed}
                  distance={distance}
                />
              );
            }}
            ListEmptyComponent={<EmptyActivitiesList />}
            initialNumToRender={5}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        <FloatingBtn onPressFn={() => router.push('/save-activity/')} />
      </SafeAreaView>
    </>
  );
}
