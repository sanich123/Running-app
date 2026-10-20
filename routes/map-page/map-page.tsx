import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useGetActivityByActivityIdQuery, useGetLocationsByActivityIdQuery } from '@R/services/activity/activity';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ActivityRouteReplay from '@S/activity-route-replay/activity-route-replay';
import DisplayActivityMap from '@S/display-activity-map/display-activity-map';
import ErrorComponent from '@S/error-component/error-component';
import { MAP_PAGE_COPY } from './const';
import type { MapPageProps, MapPageSearchParams } from './types';

export default function MapPage({ onVideoExportStateChange }: MapPageProps) {
  const { colors } = useTheme();
  const { id: activityId, replay, userId: profileId } = useLocalSearchParams<MapPageSearchParams>();
  const isReplay = replay === '1';
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    data: activityDetails,
    isLoading: isActivityDetailsLoading,
    isError: isActivityDetailsError,
    error: activityDetailsError,
    refetch: refetchActivityDetails,
  } = useGetActivityByActivityIdQuery(
    { activityId: activityId ?? '', viewerId: currentUserId ?? '' },
    {
      skip: !activityId || !currentUserId,
    },
  );
  const isOwnActivity = activityDetails?.userId === currentUserId;
  const isMapHiddenFromViewer = Boolean(activityDetails?.hideMap && !isOwnActivity);
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
  } = useGetLocationsByActivityIdQuery(
    { activityId: activityId ?? '', replay: isReplay },
    { skip: !activityId || !currentUserId || !activityDetails || isMapHiddenFromViewer },
  );
  const copy = MAP_PAGE_COPY[language === LANGUAGES.russian ? LANGUAGES.russian : LANGUAGES.english];

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[
        { flex: 1, backgroundColor: colors.background },
        (isLoading || isActivityDetailsLoading || error || isActivityDetailsError) && styles.isInCenter,
      ]}>
      {isActivityDetailsLoading || isLoading ? (
        <ActivityIndicator size="large" testID="map-page-loading" />
      ) : isActivityDetailsError ? (
        <ErrorComponent error={activityDetailsError} refetch={refetchActivityDetails} />
      ) : isMapHiddenFromViewer ? (
        <Text style={[styles.hiddenMap, { color: colors.onSurfaceVariant }]}>{copy.hiddenMap}</Text>
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
  hiddenMap: { paddingHorizontal: 24, textAlign: 'center' },
});
