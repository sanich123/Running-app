import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { activityApi } from '@R/services/activity/activity';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import ShowMetrics from '@S/card/show-metrics/show-metrics';
import { getAverageCadence, isRunningActivity, isWalkingActivity } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import { useActivityCard } from '../context';
import { CARD_METRICS } from './const';
import { getCardAdditionalMetric, getCardSpeedMetric } from './utils';
import type { ActivityCardMetric } from './types';

export default function Metrics() {
  const { width } = useWindowDimensions();
  const { activity, isFullView, isShowDescription } = useActivityCard();
  const {
    distance,
    duration,
    title,
    description,
    userId,
    id,
    sport,
    steps,
    elevationGain,
    caloriesActive,
    averageHeartRate,
    minHeartRate,
    maxHeartRate,
  } = activity;
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { userId: viewerId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const pathname = usePathname();
  const labels = CARD_METRICS[language];
  const isOwnActivity = userId === viewerId;
  const canViewHeartRate = isOwnActivity || activity.profile.allowActivityHeartRateViewing !== false;
  const canViewElevation = isOwnActivity || activity.profile.allowActivityElevationViewing !== false;
  const canViewPace = isOwnActivity || activity.profile.allowActivityPaceViewing !== false;
  const speedMetric = getCardSpeedMetric({ sport, distance, duration, language });
  const additionalMetric = getCardAdditionalMetric({ sport, steps, elevationGain, language });
  const visibleAdditionalMetric =
    additionalMetric && (additionalMetric.title !== labels.elevation || canViewElevation) ? additionalMetric : null;
  const fullViewMetricsWidth = width < MAX_MOBILE_WIDTH ? '100%' : '50%';
  const fullViewMetrics: ActivityCardMetric[] = [
    { title: isFullView ? labels.duration : labels.time, metrics: formatDuration(duration) },
    { title: labels.distance, metrics: `${(distance / 1000).toFixed(2)} ${labels.km}` },
  ];

  if (isFullView) {
    if (canViewHeartRate && typeof averageHeartRate === 'number' && Number.isFinite(averageHeartRate)) {
      fullViewMetrics.push({
        title: labels.averageHeartRate,
        metrics: `${Math.round(averageHeartRate)} ${labels.heartRateUnit}`,
      });
    }
    if (canViewPace) fullViewMetrics.push({ title: speedMetric.title, metrics: speedMetric.metrics });
    if (canViewElevation && elevationGain > 0) {
      fullViewMetrics.push({ title: labels.elevation, metrics: `${Math.round(elevationGain)} ${labels.m}` });
    }
    if (isRunningActivity(sport)) {
      const averageCadence = getAverageCadence(steps, duration);
      if (averageCadence > 0) {
        fullViewMetrics.push({ title: labels.averageCadence, metrics: `${averageCadence} ${labels.spm}` });
      }
    } else if (isWalkingActivity(sport) && steps != null && steps > 1) {
      fullViewMetrics.push({ title: labels.steps, metrics: `${steps}` });
    }
    if (caloriesActive != null) {
      fullViewMetrics.push({ title: labels.calories, metrics: `${caloriesActive} ${labels.kcal}` });
    }
    if (canViewHeartRate && typeof maxHeartRate === 'number' && Number.isFinite(maxHeartRate)) {
      fullViewMetrics.push({
        title: labels.maxHeartRate,
        metrics: `${Math.round(maxHeartRate)} ${labels.heartRateUnit}`,
      });
    }
    if (canViewHeartRate && typeof minHeartRate === 'number' && Number.isFinite(minHeartRate)) {
      fullViewMetrics.push({
        title: labels.minHeartRate,
        metrics: `${Math.round(minHeartRate)} ${labels.heartRateUnit}`,
      });
    }
  }

  return (
    <TouchableRipple
      onPress={() => {
        if (pathname !== `/activity/${id}`) {
          if (viewerId) {
            void dispatch(
              activityApi.util.prefetch('getActivityByActivityId', { activityId: id, viewerId }, { ifOlderThan: 60 }),
            );
            void dispatch(
              activityApi.util.prefetch('getActivityChartData', { activityId: id, viewerId }, { ifOlderThan: 60 }),
            );
          }
          push(`/${ROUTES.activity}/${id}?userId=${userId}`);
        }
      }}
      borderless
      style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
      <>
        {title ? (
          <Text
            variant="titleMedium"
            numberOfLines={isFullView ? undefined : 2}
            ellipsizeMode="tail"
            style={styles.title}>
            {title}
          </Text>
        ) : null}
        {isShowDescription ? (
          <View
            style={[
              styles.descriptionCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.outlineVariant,
              },
            ]}>
            <Text
              variant="bodyLarge"
              numberOfLines={isFullView ? undefined : 4}
              ellipsizeMode="tail"
              style={[styles.descriptionText, { color: colors.onBackground }]}>
              {description}
            </Text>
          </View>
        ) : null}
        {isFullView ? (
          <View
            style={[
              styles.fullViewCard,
              { backgroundColor: colors.surface, borderColor: colors.outlineVariant, width: fullViewMetricsWidth },
            ]}>
            <View style={styles.metricsGrid}>
              {fullViewMetrics.map(({ title: metricTitle, metrics }, index) => {
                const isLastRow = index >= fullViewMetrics.length - (fullViewMetrics.length % 2 || 2);
                const isLastSingleCell = index === fullViewMetrics.length - 1 && fullViewMetrics.length % 2 === 1;
                return (
                  <View
                    key={metricTitle}
                    style={[
                      styles.metricCell,
                      index % 2 === 0 && styles.metricCellLeft,
                      isLastSingleCell && styles.metricCellSingle,
                      !isLastRow && styles.metricCellBottom,
                      { borderColor: colors.outlineVariant },
                    ]}>
                    <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                      {metricTitle}
                    </Text>
                    <Text variant="titleMedium" numberOfLines={1}>
                      {metrics}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.metricsWrapper}>
            <ShowMetrics title={`${labels.time}: `} metrics={formatDuration(duration)} />
            {canViewPace ? <ShowMetrics title={`${speedMetric.title}: `} metrics={speedMetric.metrics} /> : null}
            <ShowMetrics title={`${labels.distance}: `} metrics={`${(distance / 1000).toFixed(2)} ${labels.km}`} />
            {visibleAdditionalMetric ? (
              <ShowMetrics title={`${visibleAdditionalMetric.title}: `} metrics={visibleAdditionalMetric.metrics} />
            ) : null}
          </View>
        )}
      </>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  metricsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    marginTop: 6,
  },
  fullViewCard: {
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 12,
    overflow: 'hidden',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricCell: {
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '50%',
  },
  metricCellLeft: { borderRightWidth: StyleSheet.hairlineWidth },
  metricCellSingle: { borderRightWidth: 0, width: '100%' },
  metricCellBottom: { borderBottomWidth: StyleSheet.hairlineWidth },
  title: {
    fontFamily: FONT_FAMILIES.semiBold,
    marginBottom: 2,
  },
  descriptionCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  descriptionText: {
    lineHeight: 23,
  },
});
