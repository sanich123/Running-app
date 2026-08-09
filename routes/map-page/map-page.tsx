import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useGetLocationsByActivityIdQuery } from '@R/services/activity/activity';
import DisplayActivityMap from '@Routes/display-activity-map/display-activity-map';
import ErrorComponent from '@Routes/error-component/error-component';

export default function MapPage() {
  const { colors } = useTheme();
  const { id: activityId } = useLocalSearchParams();
  const {
    isLoading,
    isSuccess,
    isError,
    data: activity,
    error,
    refetch,
  } = useGetLocationsByActivityIdQuery(`${activityId}`);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[{ flex: 1, backgroundColor: colors.background }, (isLoading || error) && styles.isInCenter]}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="map-page-loading" />
      ) : isSuccess ? (
        <DisplayActivityMap locations={activity?.locations} kilometresSplit={activity?.kilometresSplit} />
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
