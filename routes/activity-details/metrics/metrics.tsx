import { Platform, useWindowDimensions, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, Divider, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import { formatDuration } from '@U/time-formatter';
import { HOME_ACTIVITY_FULL_VIEW_TEST_ID, HOME_ACTIVITY_FULL_VIEW } from './const';
import { getActivityAdditionalMetric, getActivityMainMetric } from './utils';
import HeartRateChart from '../heart-rate-chart/heart-rate-chart';

export default function Metrics() {
  const { width } = useWindowDimensions();
  const { id: activityId } = useLocalSearchParams();
  const { userId } = useAppSelector(({ auth }) => auth);
  const {
    isLoading,
    data: activity,
    error,
  } = useGetActivityByActivityIdQuery({ activityId: `${activityId}`, viewerId: userId ?? '' }, { skip: !userId });
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const gainedElevation = activity?.elevationGain ?? 0;
  const roundedGainedElevation = Math.round(Math.max(0, gainedElevation));
  const hasElevationGain = gainedElevation > 0;
  const mainMetric = activity
    ? getActivityMainMetric({
        sport: activity.sport,
        distance: activity.distance,
        duration: activity.duration,
        language,
      })
    : null;
  const additionalMetric = activity
    ? getActivityAdditionalMetric({
        sport: activity.sport,
        steps: activity.steps,
        duration: activity.duration,
        language,
      })
    : null;
  const heartRateMetrics: { label: string; value: number }[] = [];
  if (activity) {
    [
      { label: HOME_ACTIVITY_FULL_VIEW[language].averageHeartRate, value: activity.averageHeartRate },
      { label: HOME_ACTIVITY_FULL_VIEW[language].minHeartRate, value: activity.minHeartRate },
      { label: HOME_ACTIVITY_FULL_VIEW[language].maxHeartRate, value: activity.maxHeartRate },
    ].forEach(({ label, value }) => {
      if (typeof value === 'number' && Number.isFinite(value)) heartRateMetrics.push({ label, value });
    });
  }

  return (
    <View
      style={[
        styles.layout,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
        isLoading && styles.isCenter,
        {
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}>
      {isLoading && <ActivityIndicator testID={HOME_ACTIVITY_FULL_VIEW_TEST_ID} />}
      {error ? <ErrorComponent error={error} /> : null}
      {activity && (
        <>
          <View style={styles.columnLayout}>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].distance}</Text>
              <Text variant="titleLarge">
                {(activity.distance / 1000).toFixed(2)} {`${HOME_ACTIVITY_FULL_VIEW[language].km}`}
              </Text>
            </View>

            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">{mainMetric?.title}</Text>
              <Text variant="titleLarge">{mainMetric?.value}</Text>
            </View>
          </View>
          <Divider />
          <View style={styles.columnLayout}>
            <View style={styles.alignedCenter}>
              <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].movingTime}</Text>
              <Text variant="titleLarge">{formatDuration(activity.duration)}</Text>
            </View>
            {hasElevationGain ? (
              <View style={styles.alignedCenter}>
                <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].elevationGain}</Text>
                <Text variant="titleLarge">{`${roundedGainedElevation} ${HOME_ACTIVITY_FULL_VIEW[language].m}`}</Text>
              </View>
            ) : null}
          </View>
          {additionalMetric && (
            <>
              <Divider />
              <View style={styles.columnLayout}>
                <View style={styles.alignedCenter}>
                  <Text variant="bodyLarge">{additionalMetric.title}</Text>
                  <Text variant="titleLarge">{additionalMetric.value}</Text>
                </View>
              </View>
            </>
          )}
          {heartRateMetrics.length > 0 && (
            <>
              <Divider />
              <View style={styles.heartRateSection}>
                <Text variant="bodyLarge">{HOME_ACTIVITY_FULL_VIEW[language].heartRate}</Text>
                <View style={styles.columnLayout}>
                  {heartRateMetrics.map(({ label, value }) => (
                    <View key={label} style={styles.alignedCenter}>
                      <Text variant="bodySmall">{label}</Text>
                      <Text variant="titleMedium">
                        {Math.round(value)} {HOME_ACTIVITY_FULL_VIEW[language].heartRateUnit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
          {heartRateMetrics.length > 0 && activity ? (
            <HeartRateChart activityId={activity.id} activityDistance={activity.distance} sport={activity.sport} />
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    borderRadius: 18,
    borderWidth: 1,
    display: 'flex',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  isCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnLayout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 10,
  },
  alignedCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateSection: {
    paddingTop: 10,
  },
});
