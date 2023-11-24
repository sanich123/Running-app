import DisplayActivityMap from '@C/display-activity-map/display-activity-map';
import ErrorComponent from '@C/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function ActivityMap() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId.toString());
  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity ? (
        <DisplayActivityMap locations={activity.locations} kilometresSplit={activity.kilometresSplit} />
      ) : null}
    </SafeAreaView>
  );
}
