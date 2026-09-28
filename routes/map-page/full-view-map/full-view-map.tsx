import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { useGetLocationsByActivityIdQuery } from '@R/services/activity/activity';
import DisplayActivityMap from '@S/display-activity-map/display-activity-map';
import ErrorComponent from '@S/error-component/error-component';

export default function FullViewMap() {
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    isSuccess,
    isError,
    data: activity,
    error,
    refetch,
  } = useGetLocationsByActivityIdQuery({ activityId: `${activityId}` });

  return (
    <SafeAreaView edges={['left', 'right']} style={[{ flex: 1 }, (isLoading || error) && styles.isInCenter]}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="full-view-map-loading" />
      ) : isSuccess ? (
        <DisplayActivityMap locations={activity?.locations ?? []} kilometresSplit={activity?.kilometresSplit ?? []} />
      ) : isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
