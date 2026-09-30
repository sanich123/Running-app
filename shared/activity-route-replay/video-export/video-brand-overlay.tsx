import { useEffect } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import UserAvatar from '@S/avatar/avatar';
import { CARD_METRICS } from '@S/card/metrics/const';
import { isRunningActivity } from '@U/location/location-utils';
import type { ReplayCopy } from '../types';
import type { ProfileType } from '@S/card/types';

interface VideoBrandOverlayProps {
  sport?: string;
  workoutDate?: string;
  profile?: ProfileType;
  workoutDuration: number;
  distance: number;
  progress: number;
  currentSpeed: number | null;
  language: LANGUAGES;
  copy: ReplayCopy;
  isCoverFrame?: boolean;
  onCoverReady?: () => void;
}

const ACTIVITY_LABELS = {
  [LANGUAGES.english]: {
    [SPORTS_BTNS_VALUES.run]: 'RUN',
    [SPORTS_BTNS_VALUES.walk]: 'WALK',
    [SPORTS_BTNS_VALUES.bike]: 'CYCLING',
    [SPORTS_BTNS_VALUES.ride]: 'CYCLING',
    [SPORTS_BTNS_VALUES.hike]: 'HIKING',
    [SPORTS_BTNS_VALUES.swim]: 'SWIMMING',
    [SPORTS_BTNS_VALUES.workout]: 'WORKOUT',
  },
  [LANGUAGES.russian]: {
    [SPORTS_BTNS_VALUES.run]: 'БЕГ',
    [SPORTS_BTNS_VALUES.walk]: 'ПРОГУЛКА',
    [SPORTS_BTNS_VALUES.bike]: 'ВЕЛОСПОРТ',
    [SPORTS_BTNS_VALUES.ride]: 'ВЕЛОСПОРТ',
    [SPORTS_BTNS_VALUES.hike]: 'ПОХОД',
    [SPORTS_BTNS_VALUES.swim]: 'ПЛАВАНИЕ',
    [SPORTS_BTNS_VALUES.workout]: 'ТРЕНИРОВКА',
  },
} as const;

function formatWorkoutTime(timeMs: number) {
  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${minutes}:${paddedSeconds}`;
}

function formatRunningPace(speedMetersPerSecond: number, paceUnit: string) {
  const secondsPerKilometer = Math.round(1000 / speedMetersPerSecond);
  const minutes = Math.floor(secondsPerKilometer / 60);
  const seconds = String(secondsPerKilometer % 60).padStart(2, '0');

  return `${minutes}:${seconds} ${paceUnit}`;
}

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
      <View style={styles.brandHeader}>
        <Image
          source={require('../../../assets/images/runich-logo.png')}
          resizeMode="contain"
          style={styles.brandIcon}
        />
        <Text style={styles.brandName}>RUNICH</Text>
        {isCoverFrame ? (
          <View style={styles.identity}>
            <UserAvatar
              size={34}
              profilePhoto={profile?.profilePhoto}
              name={profile?.name}
              surname={profile?.surname}
              placeholder={profile?.profilePhotoBlurhash}
              cachePolicy="disk"
              recyclingKey={profile?.profilePhoto}
              transition={0}
            />
            <Text numberOfLines={1} style={styles.athleteName}>
              {athleteName}
            </Text>
          </View>
        ) : null}
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
              {formatWorkoutTime(workoutDuration * (isCoverFrame ? 1 : progress))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { elevation: 2, zIndex: 2 },
  coverOverlay: { backgroundColor: '#141618' },
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
  identity: { alignItems: 'center', flexDirection: 'row', gap: 8, maxWidth: '62%', minWidth: 0 },
  athleteName: { color: '#FFFFFF', flexShrink: 1, fontSize: 12, fontWeight: '700' },
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
});
