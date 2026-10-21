import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Divider, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityChartDataQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import ErrorComponent from '@S/error-component/error-component';
import ActivityTimeChart from './activity-time-chart/activity-time-chart';
import {
  buildActivityChartSeries,
  buildHeartRateZoneDistribution,
  formatHeartRateZoneRange,
  formatHeartRateZoneDuration,
  getHeartRateZoneSettings,
  HEART_RATE_ZONE_COLORS,
} from './utils';
import { HOME_ACTIVITY_FULL_VIEW } from '../metrics/const';
import type { ActivityChartProps } from './types';

export default function ActivityChart({
  activityId,
  activityDistance,
  maxHeartRate,
  profileRestingHeartRate,
  profileMaximumHeartRate,
  profileAge,
  sport,
  canViewHeartRate = true,
  canViewElevation = true,
  canViewPace = true,
}: ActivityChartProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const canViewChart = [canViewHeartRate, canViewElevation, canViewPace].filter(Boolean).length >= 2;
  const { data, error, isLoading, refetch } = useGetActivityChartDataQuery(
    { activityId, viewerId: userId ?? '' },
    { skip: !userId || !canViewChart },
  );
  const labels = HOME_ACTIVITY_FULL_VIEW[language];
  const chartSeries = data
    ? buildActivityChartSeries(data, sport, activityDistance).filter(({ metric }) => {
        if (metric === 'heartRate') return canViewHeartRate;
        if (metric === 'elevation') return canViewElevation;
        return canViewPace;
      })
    : [];
  const heartRateSeries = chartSeries.find(({ metric }) => metric === 'heartRate');
  const shouldShowChart = !isLoading && !error && chartSeries.length > 0;
  const activityMaximumHeartRate = Math.max(
    heartRateSeries?.maxValue ?? 0,
    typeof maxHeartRate === 'number' && Number.isFinite(maxHeartRate) ? maxHeartRate : 0,
  );
  const zoneSettings = getHeartRateZoneSettings({
    activityMaximumHeartRate,
    profileAge,
    profileMaximumHeartRate,
    profileRestingHeartRate,
  });
  const zones = heartRateSeries ? buildHeartRateZoneDistribution(heartRateSeries, zoneSettings) : [];
  const zoneHint =
    zoneSettings.basis === 'heartRateReserve'
      ? labels.heartRateZonesProfileHint(zoneSettings.restingHeartRate, zoneSettings.maximumHeartRate)
      : zoneSettings.basis === 'age'
        ? labels.heartRateZonesAgeHint(Number(profileAge), zoneSettings.maximumHeartRate)
        : labels.heartRateZonesActivityHint(zoneSettings.maximumHeartRate);

  if (!canViewChart) return null;

  return (
    <>
      {isLoading ? (
        <View style={styles.state}>
          <Divider />
          <ActivityIndicator size="small" />
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {labels.chartLoading}
          </Text>
        </View>
      ) : null}
      {!isLoading && error ? <ErrorComponent error={error} refetch={refetch} /> : null}
      {shouldShowChart ? (
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
              width: '100%',
              maxWidth: MAX_MOBILE_WIDTH,
              marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
            },
          ]}>
          <Text variant="titleLarge" style={styles.title}>
            {labels.graphTitle}
          </Text>
          <ActivityTimeChart chartSeries={chartSeries} zoneSettings={zoneSettings} language={language} />
          {heartRateSeries ? (
            <View style={styles.zones}>
              <Text variant="titleSmall" style={styles.zonesTitle}>
                {labels.heartRateZonesTitle}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {zoneHint}
              </Text>
              {zones.map(({ zone, percentage, duration }) => (
                <View key={zone} style={styles.zoneRow}>
                  <Text variant="labelMedium" style={[styles.zoneNumber, { color: HEART_RATE_ZONE_COLORS[zone - 1] }]}>
                    {zone}
                  </Text>
                  <Text variant="labelSmall" style={styles.zoneRange}>
                    {formatHeartRateZoneRange(zone, zoneSettings)}
                  </Text>
                  <View style={[styles.zoneTrack, { backgroundColor: colors.outlineVariant }]}>
                    <View
                      style={[
                        styles.zoneProgress,
                        { backgroundColor: HEART_RATE_ZONE_COLORS[zone - 1], width: `${percentage}%` },
                      ]}
                    />
                  </View>
                  <Text variant="labelMedium" style={styles.zonePercentage}>
                    {percentage} %
                  </Text>
                  <Text variant="labelMedium" style={styles.zoneDuration}>
                    {formatHeartRateZoneDuration(duration)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  state: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
  },
  title: {
    fontWeight: '800',
  },
  zones: {
    gap: 9,
    paddingTop: 8,
  },
  zonesTitle: {
    fontWeight: '600',
    paddingBottom: 2,
  },
  zoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  zoneNumber: {
    textAlign: 'left',
    width: 18,
  },
  zoneRange: {
    textAlign: 'left',
    width: 58,
  },
  zoneTrack: {
    borderRadius: 4,
    flex: 1,
    height: 5,
    overflow: 'hidden',
  },
  zoneProgress: {
    borderRadius: 4,
    height: '100%',
  },
  zonePercentage: {
    textAlign: 'right',
    width: 40,
  },
  zoneDuration: {
    textAlign: 'right',
    width: 55,
  },
});
