import ActivityCard from '@c/activity-card/activity-card';
import ErrorComponent from '@c/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '@r/runnich-api/runnich-api';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function ViewActivityFullInfo() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <ActivityCard
          userId={activity.user_id}
          description={activity.description}
          title={activity.title}
          date={activity.date}
          sport={activity.sport}
          id={activity.id}
          locations={activity.locations}
          photoUrls={activity.photoUrls}
          duration={activity.duration}
          speed={activity.speed}
          distance={activity.distance}
        />
      )}
    </SafeAreaView>
  );
}
