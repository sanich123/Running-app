import DisplayActivityMap from '@C/display-activity-map/display-activity-map';
import ErrorComponent from '@C/error-component/error-component';
import { useGetLocationsByActivityIdQuery } from '@R/runich-api/runich-api';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FullViewMap() {
  const { id: activityId } = useLocalSearchParams();
  const { isLoading, data: activity, error } = useGetLocationsByActivityIdQuery(`${activityId}`);

  return (
    <SafeAreaView edges={['left', 'right']} style={[{ flex: 1 }, (isLoading || error) && styles.isInCenter]}>
      {isLoading && <ActivityIndicator size="large" />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && <DisplayActivityMap locations={activity?.locations} kilometresSplit={activity?.kilometresSplit} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
