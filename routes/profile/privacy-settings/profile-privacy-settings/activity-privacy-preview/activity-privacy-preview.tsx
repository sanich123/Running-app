import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import ActivityPreviewGraph from './activity-preview-graph/activity-preview-graph';
import { ACTIVITY_PREVIEW_HEART_RATE_ZONES, ACTIVITY_PREVIEW_METRIC_COLORS } from './const';
import { PROFILE_PREVIEW_PHOTO, PROFILE_PRIVACY_SETTINGS } from '../../const';
import type { ActivityPrivacyPreviewMetricOption } from './activity-preview-graph/types';
import type { ActivityPrivacyPreviewProps } from './types';

export default function ActivityPrivacyPreview({
  allowActivityInteractions,
  allowActivityHeartRateViewing,
  allowActivityElevationViewing,
  allowActivityPaceViewing,
  allowActivityReplayViewing,
  allowActivitySharing,
  language,
}: ActivityPrivacyPreviewProps) {
  const { colors } = useTheme();
  const copy = PROFILE_PRIVACY_SETTINGS[language];
  const metricOptions: ActivityPrivacyPreviewMetricOption[] = [
    {
      key: 'heartRate',
      label: copy.activityPreviewHeartRateMetric,
      color: ACTIVITY_PREVIEW_METRIC_COLORS.heartRate,
      isVisible: allowActivityHeartRateViewing,
    },
    {
      key: 'pace',
      label: copy.activityPreviewPaceMetric,
      color: ACTIVITY_PREVIEW_METRIC_COLORS.pace,
      isVisible: allowActivityPaceViewing,
    },
    {
      key: 'elevation',
      label: copy.activityPreviewElevationMetric,
      color: ACTIVITY_PREVIEW_METRIC_COLORS.elevation,
      isVisible: allowActivityElevationViewing,
    },
  ];
  const visibleMetrics = metricOptions.filter(({ isVisible }) => isVisible);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}>
      <View style={styles.heading}>
        <Text variant="titleSmall">{copy.activityPreviewTitle}</Text>
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          {copy.activityPreviewHint}
        </Text>
      </View>

      <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={[styles.activityHeader, { borderBottomColor: colors.outlineVariant }]}>
          <View
            testID="privacy-activity-preview-avatar"
            style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
            <Image
              testID="privacy-activity-preview-avatar-photo"
              accessibilityLabel={copy.activityPreviewProfileName}
              source={PROFILE_PREVIEW_PHOTO}
              contentFit="cover"
              style={styles.avatarPhoto}
            />
          </View>
          <View style={styles.activityTitle}>
            <Text variant="labelLarge">{copy.activityPreviewProfileName}</Text>
            <View style={styles.activityDate}>
              <Icon source="walk" size={13} color={colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                {copy.activityPreviewDate}
              </Text>
            </View>
          </View>
        </View>

        <View testID="privacy-activity-preview-map" style={[styles.map, { backgroundColor: colors.surfaceVariant }]}>
          <View style={styles.mapWeather}>
            <Icon source="weather-cloudy" size={13} color="#FFFFFF" />
            <Text variant="labelSmall" style={styles.mapWeatherText}>
              {copy.activityPreviewTemperature}
            </Text>
            <Text variant="labelSmall" style={styles.mapWeatherText}>
              {copy.activityPreviewWeather}
            </Text>
          </View>
          <View style={[styles.mapRoad, styles.mapRoadOne]} />
          <View style={[styles.mapRoad, styles.mapRoadTwo]} />
          {allowActivityReplayViewing ? (
            <>
              <View style={styles.routeLine} />
              <View style={[styles.routePoint, styles.routeStart]} />
              <View style={[styles.routePoint, styles.routeFinish]} />
              <View
                testID="privacy-activity-preview-map-replay"
                accessibilityRole="button"
                accessibilityLabel={copy.activityPreviewReplay}
                style={[styles.replayButton, { backgroundColor: colors.surface }]}>
                <Icon source="play" size={14} color={colors.primary} />
              </View>
            </>
          ) : (
            <View
              testID="privacy-activity-preview-map-hidden"
              style={[styles.mapHiddenOverlay, { backgroundColor: colors.surface + 'D9' }]}>
              <Icon source="map-marker-off-outline" size={20} color={colors.onSurfaceVariant} />
              <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
                {copy.activityPreviewMapHidden}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.activityName}>
          <Text variant="titleSmall">{copy.activityPreviewActivityName}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCell, { borderColor: colors.outlineVariant }]}>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.activityPreviewDuration}
            </Text>
            <Text variant="labelLarge">{copy.activityPreviewDurationValue}</Text>
          </View>
          <View style={[styles.summaryCell, { borderColor: colors.outlineVariant }]}>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {copy.activityPreviewDistance}
            </Text>
            <Text variant="labelLarge">{copy.activityPreviewDistanceValue}</Text>
          </View>
          {metricOptions.map(({ key, label, isVisible }) => (
            <View
              key={key}
              testID={`privacy-activity-preview-summary-${key}`}
              style={[styles.summaryCell, { borderColor: colors.outlineVariant }, !isVisible && styles.inactiveBlock]}>
              <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                {label}
              </Text>
              {isVisible ? (
                <Text variant="labelLarge">
                  {key === 'heartRate'
                    ? copy.activityPreviewHeartRateValue
                    : key === 'pace'
                      ? copy.activityPreviewPaceValue
                      : copy.activityPreviewElevationValue}
                </Text>
              ) : (
                <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
                  {copy.activityPreviewMetricHidden}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.likesPreview}>
          <View style={[styles.likeAvatar, { backgroundColor: colors.primaryContainer }]} />
          <View style={[styles.likeAvatar, styles.secondLikeAvatar, { backgroundColor: colors.secondaryContainer }]} />
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            2
          </Text>
        </View>

        <View
          testID="privacy-activity-preview-social-actions"
          style={[styles.socialActions, { borderTopColor: colors.outlineVariant }]}>
          <View
            testID="privacy-activity-preview-like"
            accessibilityRole="button"
            accessibilityLabel={copy.activityPreviewLike}
            style={[styles.socialAction, !allowActivityInteractions && styles.inactiveBlock]}>
            <Icon source="thumb-up-outline" size={19} color={colors.primary} />
          </View>
          <View
            testID="privacy-activity-preview-comment"
            accessibilityRole="button"
            accessibilityLabel={copy.activityPreviewComment}
            style={[styles.socialAction, !allowActivityInteractions && styles.inactiveBlock]}>
            <Icon source="comment-outline" size={19} color={colors.primary} />
          </View>
          <View
            testID="privacy-activity-preview-share"
            accessibilityRole="button"
            accessibilityLabel={copy.activityPreviewShare}
            style={[styles.socialAction, !allowActivitySharing && styles.inactiveBlock]}>
            <Icon source="share-outline" size={19} color={colors.primary} />
          </View>
        </View>
      </View>

      <ActivityPreviewGraph language={language} visibleMetrics={visibleMetrics} />

      <View
        testID="privacy-activity-preview-heart-rate-zones"
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
          !allowActivityHeartRateViewing && styles.inactiveBlock,
        ]}>
        <View style={styles.sectionHeading}>
          <Text variant="labelLarge">{copy.activityPreviewHeartRateZones}</Text>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
            {allowActivityHeartRateViewing ? copy.activityPreviewMetricVisible : copy.activityPreviewMetricHidden}
          </Text>
        </View>
        {allowActivityHeartRateViewing ? (
          <View>
            <View style={styles.zoneRow}>
              <Text variant="labelSmall" style={[styles.zoneLabel, { color: colors.onSurfaceVariant }]}>
                {copy.activityPreviewZoneLabel}
              </Text>
              <Text variant="labelSmall" style={[styles.zonePercentage, { color: colors.onSurfaceVariant }]}>
                %
              </Text>
              <Text variant="labelSmall" style={[styles.zoneDuration, { color: colors.onSurfaceVariant }]}>
                {copy.activityPreviewTime}
              </Text>
            </View>
            {ACTIVITY_PREVIEW_HEART_RATE_ZONES.map(({ zone, percentage, duration, color }) => (
              <View key={zone} testID={`privacy-activity-preview-heart-rate-zone-${zone}`} style={styles.zoneRow}>
                <Text variant="labelMedium" style={[styles.zoneLabel, { color }]}>
                  {zone}
                </Text>
                <Text variant="labelMedium" style={styles.zonePercentage}>
                  {percentage}
                </Text>
                <Text variant="labelMedium" style={styles.zoneDuration}>
                  {duration}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text variant="labelLarge">{copy.activityPreviewDetailedStatisticsTitle}</Text>
        {metricOptions.map(({ key, label, isVisible }) => (
          <View
            key={key}
            testID={`privacy-activity-preview-detail-${key}`}
            style={[styles.detailRow, !isVisible && styles.inactiveBlock]}>
            <Text variant="bodySmall">{label}</Text>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {isVisible ? copy.activityPreviewMetricVisible : copy.activityPreviewMetricHidden}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 4, padding: 10 },
  heading: { gap: 2 },
  activityCard: { borderRadius: 10, borderWidth: 1, gap: 0, overflow: 'hidden' },
  activityHeader: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  avatar: { alignItems: 'center', borderRadius: 16, height: 30, justifyContent: 'center', width: 30 },
  avatarPhoto: { borderRadius: 15, height: 30, width: 30 },
  activityTitle: { flex: 1, gap: 2, minWidth: 0 },
  activityDate: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  map: { height: 116, overflow: 'hidden', position: 'relative' },
  mapWeather: {
    alignItems: 'center',
    backgroundColor: '#00000055',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 4,
    left: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
    top: 7,
    zIndex: 1,
  },
  mapWeatherText: { color: '#FFFFFF' },
  mapRoad: { backgroundColor: '#FFFFFF55', height: 2, position: 'absolute', width: '130%' },
  mapRoadOne: { left: '-12%', top: '40%', transform: [{ rotate: '-14deg' }] },
  mapRoadTwo: { left: '-12%', top: '68%', transform: [{ rotate: '18deg' }] },
  routeLine: {
    backgroundColor: '#F3653B',
    height: 4,
    left: '27%',
    position: 'absolute',
    top: '48%',
    transform: [{ rotate: '-28deg' }],
    width: '48%',
  },
  routePoint: {
    backgroundColor: '#F3653B',
    borderColor: '#FFFFFF',
    borderRadius: 7,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    width: 12,
  },
  routeStart: { left: '26%', top: '62%' },
  routeFinish: { left: '69%', top: '24%' },
  replayButton: {
    alignItems: 'center',
    borderRadius: 16,
    bottom: 7,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 7,
    width: 28,
  },
  mapHiddenOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  activityName: { paddingHorizontal: 10, paddingTop: 10 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 },
  summaryCell: { borderBottomWidth: StyleSheet.hairlineWidth, gap: 4, minHeight: 50, padding: 6, width: '50%' },
  inactiveBlock: { opacity: 0.3 },
  likesPreview: { alignItems: 'center', flexDirection: 'row', gap: 5, minHeight: 32, paddingHorizontal: 10 },
  likeAvatar: { borderColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, height: 16, width: 16 },
  secondLikeAvatar: { marginLeft: -9 },
  socialActions: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 42,
    paddingHorizontal: 4,
  },
  socialAction: { alignItems: 'center', flex: 1, height: 38, justifyContent: 'center' },
  section: { borderRadius: 8, borderWidth: 1, gap: 8, padding: 8 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  zoneRow: {
    alignItems: 'center',
    borderTopColor: '#00000012',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 23,
    paddingHorizontal: 2,
  },
  zoneLabel: { flex: 1 },
  zonePercentage: { textAlign: 'right', width: 52 },
  zoneDuration: { textAlign: 'right', width: 60 },
  detailRow: {
    alignItems: 'center',
    borderTopColor: '#00000012',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 24,
  },
});
