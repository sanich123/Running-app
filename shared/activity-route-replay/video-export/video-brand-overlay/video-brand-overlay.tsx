import { useEffect } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import UserAvatar from '@S/avatar/user-avatar/user-avatar';
import { CARD_METRICS } from '@S/card/metrics/const';
import { isRunningActivity } from '@U/location/location-utils';
import { ACTIVITY_LABELS } from './const';
import { formatWorkoutTime, formatRunningPace } from './utils';
import type { VideoBrandOverlayProps } from './types';

export default function VideoBrandOverlay({
  sport,
  workoutDate,
  profile,
  workoutDuration,
  distance,
  progress,
  currentSpeed,
  language,
  copy,
  isCoverFrame = false,
  onCoverReady,
}: VideoBrandOverlayProps) {
  useEffect(() => {
    if (!isCoverFrame) return;
    if (!profile?.profilePhoto) {
      onCoverReady?.();
      return;
    }

    void ExpoImage.prefetch(profile.profilePhoto, { cachePolicy: 'disk' })
      .catch(() => false)
      .finally(() => onCoverReady?.());
  }, [isCoverFrame, onCoverReady, profile?.profilePhoto]);

  const metrics = CARD_METRICS[language];
  const normalizedSport = sport?.toLowerCase() ?? '';
  const activityLabel =
    ACTIVITY_LABELS[language][normalizedSport as keyof (typeof ACTIVITY_LABELS)[typeof language]] ??
    sport?.toUpperCase() ??
    (language === LANGUAGES.english ? 'WORKOUT' : 'ТРЕНИРОВКА');
  const dateLabel = workoutDate
    ? new Date(workoutDate).toLocaleDateString(language === LANGUAGES.english ? 'en-US' : 'ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';
  const distanceLabel = `${(distance / 1000).toLocaleString(language === LANGUAGES.english ? 'en-US' : 'ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${metrics.km}`;
  const displaySpeed = isCoverFrame && workoutDuration > 0 ? (distance * 1000) / workoutDuration : currentSpeed;
  const speedLabel =
    displaySpeed === null || displaySpeed <= 0
      ? '—'
      : isRunningActivity(sport ?? '')
        ? formatRunningPace(displaySpeed, copy.paceUnit ?? (language === LANGUAGES.english ? 'min/km' : 'мин/км'))
        : `${(displaySpeed * 3.6).toLocaleString(language === LANGUAGES.english ? 'en-US' : 'ru-RU', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} ${metrics.kmh}`;
  const athleteName =
    [profile?.name, profile?.surname].filter(Boolean).join(' ') ||
    (language === LANGUAGES.english ? 'Athlete' : 'Спортсмен');

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, isCoverFrame && styles.coverOverlay]}>
      {isCoverFrame ? (
        <>
          <View style={[styles.brandHeader, styles.coverHeader]}>
            <Image
              source={require('../../../../assets/images/runich-logo.png')}
              resizeMode="contain"
              style={styles.coverBrandIcon}
            />
            <Text style={styles.coverBrandName}>RUNICH</Text>
            <View style={styles.coverIdentity}>
              <UserAvatar
                size={48}
                profilePhoto={profile?.profilePhoto}
                name={profile?.name}
                surname={profile?.surname}
                placeholder={profile?.profilePhotoBlurhash}
                cachePolicy="disk"
                recyclingKey={profile?.profilePhoto}
                transition={0}
              />
              <Text numberOfLines={1} style={styles.coverAthleteName}>
                {athleteName}
              </Text>
            </View>
          </View>
          <View style={[styles.bottomCard, styles.coverCard]}>
            <View style={styles.coverActivityRow}>
              <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.coverSportLabel}>
                {activityLabel}
              </Text>
              {dateLabel ? (
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.coverDateLabel}>
                  {dateLabel}
                </Text>
              ) : null}
            </View>
            <View style={styles.coverDistanceBlock}>
              <Text numberOfLines={1} style={styles.coverMetricCaption}>
                {metrics.distance}
              </Text>
              <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.coverDistance}>
                {distanceLabel}
              </Text>
            </View>
            <View style={styles.coverMetricsRow}>
              <View style={styles.coverMetricCell}>
                <Text numberOfLines={1} style={styles.coverMetricCaption}>
                  {metrics.time}
                </Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.coverMetricValue}>
                  {formatWorkoutTime(workoutDuration)}
                </Text>
              </View>
              <View style={styles.coverMetricDivider} />
              <View style={styles.coverMetricCell}>
                <Text numberOfLines={1} style={styles.coverMetricCaption}>
                  {isRunningActivity(sport ?? '') ? metrics.pace : metrics.speed}
                </Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.coverMetricValue}>
                  {speedLabel}
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.brandHeader}>
            <Image
              source={require('../../../../assets/images/runich-logo.png')}
              resizeMode="contain"
              style={styles.brandIcon}
            />
            <Text style={styles.brandName}>RUNICH</Text>
          </View>
          <View style={styles.bottomCard}>
            <View style={styles.activityRow}>
              <Text numberOfLines={1} style={styles.sportLabel}>
                {activityLabel}
              </Text>
              <Text numberOfLines={1} style={styles.dateLabel}>
                {dateLabel}
              </Text>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricCell}>
                <Text numberOfLines={1} style={styles.metricCaption}>
                  {metrics.distance}
                </Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.metricValue}>
                  {distanceLabel}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCell}>
                <Text numberOfLines={1} style={styles.metricCaption}>
                  {metrics.time}
                </Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.metricValue}>
                  {formatWorkoutTime(workoutDuration * progress)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCell}>
                <Text numberOfLines={1} style={styles.metricCaption}>
                  {isRunningActivity(sport ?? '') ? metrics.pace : metrics.speed}
                </Text>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.metricValue}>
                  {speedLabel}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { elevation: 2, zIndex: 2 },
  coverOverlay: { backgroundColor: 'rgba(8,11,12,0.18)' },
  brandHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(20,22,24,0.84)',
    borderRadius: 12,
    flexDirection: 'row',
    height: 48,
    left: 16,
    paddingHorizontal: 8,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  brandIcon: { height: 32, width: 32 },
  brandName: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginLeft: 3, marginRight: 'auto' },
  bottomCard: {
    backgroundColor: 'rgba(20,22,24,0.92)',
    borderRadius: 12,
    bottom: 20,
    left: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
    position: 'absolute',
    right: 16,
  },
  activityRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sportLabel: { color: '#FFFFFF', flexShrink: 1, fontSize: 12, fontWeight: '800', letterSpacing: 0.35 },
  dateLabel: { color: '#B7BBBE', fontSize: 10, fontWeight: '600', marginLeft: 8 },
  metricsRow: { alignItems: 'center', flexDirection: 'row' },
  metricCell: { flex: 1, gap: 4, minWidth: 0, paddingHorizontal: 7 },
  metricCaption: { color: '#9FA4A8', fontSize: 8, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  metricValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  metricDivider: { backgroundColor: 'rgba(255,255,255,0.16)', height: 32, width: 1 },
  coverHeader: { borderRadius: 12, height: 80, paddingHorizontal: 12 },
  coverBrandIcon: { height: 52, width: 52 },
  coverBrandName: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginLeft: 2, marginRight: 'auto' },
  coverIdentity: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: 9, maxWidth: '54%', minWidth: 0 },
  coverAthleteName: { color: '#FFFFFF', flexShrink: 1, fontSize: 15, fontWeight: '700' },
  coverCard: { borderRadius: 12, bottom: 18, paddingHorizontal: 18, paddingVertical: 18 },
  coverActivityRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  coverSportLabel: { color: '#FF7547', flexShrink: 1, fontSize: 20, fontWeight: '900', marginRight: 8 },
  coverDateLabel: { color: '#FFFFFF', flexShrink: 1, fontSize: 14, fontWeight: '600' },
  coverDistanceBlock: { gap: 3, marginBottom: 16 },
  coverMetricCaption: { color: '#C5C9CB', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  coverDistance: { color: '#FFFFFF', fontSize: 40, fontWeight: '900', lineHeight: 46 },
  coverMetricsRow: { alignItems: 'center', flexDirection: 'row' },
  coverMetricCell: { flex: 1, gap: 5, minWidth: 0, paddingHorizontal: 10 },
  coverMetricValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', lineHeight: 24 },
  coverMetricDivider: { backgroundColor: 'rgba(255,255,255,0.24)', height: 42, width: 1 },
});
