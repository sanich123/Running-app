import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useGetLocationsByActivityIdQuery } from '@R/services/activity/activity';
import ActivityRouteReplay from '@S/activity-route-replay/activity-route-replay';
import DisplayActivityMap from '@S/display-activity-map/display-activity-map';
import ErrorComponent from '@S/error-component/error-component';

export default function MapPage() {
  const { colors } = useTheme();
  const { id: routeId, replay } = useLocalSearchParams<{ id?: string | string[]; replay?: string | string[] }>();
  const activityId = Array.isArray(routeId) ? routeId[0] : routeId;
  const replayValue = Array.isArray(replay) ? replay[0] : replay;
  const isReplay = replayValue === '1';
  const {
    isLoading,
    isSuccess,
    isError,
    data: activity,
    error,
    refetch,
  } = useGetLocationsByActivityIdQuery({ activityId: activityId ?? '', replay: isReplay }, { skip: !activityId });

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[{ flex: 1, backgroundColor: colors.background }, (isLoading || error) && styles.isInCenter]}>
      {isLoading ? (
        <ActivityIndicator size="large" testID="map-page-loading" />
      ) : isSuccess ? (
        isReplay ? (
          <ActivityRouteReplay locations={activity?.locations ?? []} />
        ) : (
          <DisplayActivityMap locations={activity?.locations ?? []} kilometresSplit={activity?.kilometresSplit ?? []} />
        )
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
