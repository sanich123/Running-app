import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import DisplayActivityMap from '../../../../components/display-activity-map/display-activity-map';
import ErrorComponent from '../../../../components/error-component/error-component';
import { useGetActivityByActivityIdQuery } from '../../../../redux/runich-api/runich-api';

export default function ActivityMap() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetActivityByActivityIdQuery(activityId.toString());
  return (
    <SafeAreaView style={[{ flex: 1 }, isLoading && { alignItems: 'center', justifyContent: 'center' }]}>
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity ? <DisplayActivityMap locations={activity.locations} distance={activity.distance} /> : null}
    </SafeAreaView>
  );
}
