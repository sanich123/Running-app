import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import ActivityCard from '../../../../components/activity-card/activity-card';
import ErrorComponent from '../../../../components/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '../../../../redux/runnich-api/runnich-api';

export default function ViewActivityFullInfo() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId);
  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <ActivityCard
          userId={activity.userId}
          description={activity.description}
          title={activity.title}
          date={activity.date}
          sport={activity.sport}
          id={activity.id}
          locations={activity.locations}
          photoUrl={activity.photoUrl}
          duration={activity.duration}
          speed={activity.speed}
          distance={activity.distance}
        />
      )}
    </SafeAreaView>
  );
}
