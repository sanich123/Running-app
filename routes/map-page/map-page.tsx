import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useGetActivityByActivityIdQuery, useGetLocationsByActivityIdQuery } from '@R/services/activity/activity';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ActivityRouteReplay from '@S/activity-route-replay/activity-route-replay';
import DisplayActivityMap from '@S/display-activity-map/display-activity-map';
import ErrorComponent from '@S/error-component/error-component';
import type { MapPageProps, MapPageSearchParams } from './types';

export default function MapPage({ onVideoExportStateChange }: MapPageProps) {
  const { colors } = useTheme();
  const { id: activityId, replay, userId: profileId } = useLocalSearchParams<MapPageSearchParams>();
  const isReplay = replay === '1';
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { data: activityDetails } = useGetActivityByActivityIdQuery(
    { activityId: activityId ?? '', viewerId: currentUserId ?? '' },
    {
      skip: !isReplay || !activityId || !currentUserId,
    },
  );
  const replayProfileId = profileId ?? currentUserId;
  const { data: replayProfile } = useGetUserProfileByUserIdQuery(replayProfileId ?? '', {
    skip: !isReplay || !replayProfileId,
  });
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
          <ActivityRouteReplay
            locations={activity?.locations ?? []}
            profile={replayProfile ?? undefined}
            sport={activityDetails?.sport}
            workoutDate={activityDetails?.date}
            workoutDuration={activityDetails?.duration}
            onVideoExportStateChange={onVideoExportStateChange}
          />
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
