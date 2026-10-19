import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { HOME_ACTIVITY_FULL_VIEW } from './const';
import ActivityChart from '../activity-chart/activity-chart';

export default function Metrics() {
  const { id: activityId } = useLocalSearchParams();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const {
    isLoading,
    data: activity,
    error,
  } = useGetActivityByActivityIdQuery({ activityId: `${activityId}`, viewerId: userId ?? '' }, { skip: !userId });
  const isOwner = activity?.userId === userId;
  const canViewHeartRate = isOwner || activity?.profile.allowActivityHeartRateViewing !== false;
  const canViewElevation = isOwner || activity?.profile.allowActivityElevationViewing !== false;
  const canViewPace = isOwner || activity?.profile.allowActivityPaceViewing !== false;
  return (
    <>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" />
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {HOME_ACTIVITY_FULL_VIEW[language].chartLoading}
          </Text>
        </View>
      ) : null}
      {error ? <ErrorComponent error={error} /> : null}
      {activity ? (
        <ActivityChart
          activityId={activity.id}
          activityDistance={activity.distance}
          maxHeartRate={activity.maxHeartRate}
          profileRestingHeartRate={activity.profile.restingHeartRate}
          profileMaximumHeartRate={activity.profile.maxHeartRate}
          profileAge={activity.profile.age}
          sport={activity.sport}
          canViewHeartRate={canViewHeartRate}
          canViewElevation={canViewElevation}
          canViewPace={canViewPace}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', gap: 8, paddingVertical: 12 },
});
