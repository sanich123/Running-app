import { useEffect, type MutableRefObject } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import {
  EMOTIONS_BTNS_ICONS,
  EMOTIONS_BTNS_VALUES,
  normalizeEmotion,
} from '@Routes/save-activity-page/emotion-btns/const';
import UserAvatar from '@S/avatar/avatar';
import CustomImage from '@S/custom-image/custom-image';
import MapMetaOverlay from '../map-meta-overlay/map-meta-overlay';
import { getIconNameByTypeOfSport, MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { formatDuration } from '@U/time-formatter';
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH, SHARE_MAP_HEIGHT } from './const';
import Metric from './metric';
import { CARD_METRICS } from '../metrics/const';
import { getCardSpeedMetric } from '../metrics/utils';
import { getShareMapPhotoUrl } from '../utils';
import type { ActivityCardProps } from '../types';

type ShareActivityImageProps = Pick<ActivityCardProps, 'distance' | 'duration' | 'date' | 'title' | 'mapPhotoUrl'> & {
  profile?: ActivityCardProps['profile'];
  sport?: string;
  emotion?: string | null;
  elevationGain?: number;
  steps?: number | null;
  locationName?: string | null;
  weatherTemperature?: number | null;
  weatherWindSpeed?: number | null;
  weatherCode?: number | null;
  cardRef: MutableRefObject<View | null>;
  onReady?: () => void;
};

export default function ShareActivityImage({
  distance,
  duration,
  date,
  title,
  mapPhotoUrl,
  cardRef,
  sport = 'run',
  onReady,
  emotion,
  elevationGain,
  steps,
  profile,
  locationName,
  weatherTemperature,
  weatherWindSpeed,
  weatherCode,
}: ShareActivityImageProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const isRussian = language === LANGUAGES.russian;
  const shareMapPhotoUrl = getShareMapPhotoUrl(mapPhotoUrl, SHARE_IMAGE_WIDTH, SHARE_MAP_HEIGHT) ?? mapPhotoUrl;
  const speedMetric = getCardSpeedMetric({ sport, distance, duration, language });
  const sportTitle = MAP_SPORT_TO_TITLE[sport as keyof typeof MAP_SPORT_TO_TITLE]?.[language] ?? sport;
  const normalizedEmotion = normalizeEmotion(emotion);
  const emotionBadge =
    normalizedEmotion === EMOTIONS_BTNS_VALUES.good
      ? { color: '#F7C744', icon: EMOTIONS_BTNS_ICONS.iconHappy }
      : normalizedEmotion === EMOTIONS_BTNS_VALUES.fucked
        ? { color: '#FF8A65', icon: EMOTIONS_BTNS_ICONS.iconFucked }
        : normalizedEmotion === EMOTIONS_BTNS_VALUES.normal
          ? { color: '#AAB4C3', icon: EMOTIONS_BTNS_ICONS.iconNeutral }
          : null;
  const formattedDate = formatShareDate(date, duration, isRussian);
  const activityLabel = title || sportTitle;
  const metrics = [
    { label: CARD_METRICS[language].time, value: formatDuration(duration) },
    { label: CARD_METRICS[language].distance, value: `${(distance / 1000).toFixed(2)} ${CARD_METRICS[language].km}` },
    { label: speedMetric.title, value: speedMetric.metrics },
    ...(elevationGain && elevationGain > 0
      ? [{ label: CARD_METRICS[language].elevation, value: `${Math.round(elevationGain)} ${CARD_METRICS[language].m}` }]
      : []),
    ...(steps != null && steps > 0 ? [{ label: CARD_METRICS[language].steps, value: `${steps}` }] : []),
  ];

  useEffect(() => {
    if (!mapPhotoUrl) onReady?.();
  }, [mapPhotoUrl, onReady]);

  return (
    <View
      ref={cardRef}
      collapsable={false}
      pointerEvents="none"
      style={styles.captureRoot}
      testID="share-activity-image">
      <View style={styles.mapSection}>
        {mapPhotoUrl ? (
          <CustomImage
            style={styles.map}
            source={{ uri: shareMapPhotoUrl }}
            contentFit="cover"
            priority="low"
            cachePolicy="disk"
            recyclingKey={shareMapPhotoUrl}
            testID={mapPhotoUrl}
            transition={0}
            onLoad={onReady}
            onError={onReady}
          />
        ) : (
          <View style={[styles.mapFallback, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="map-marker-path" size={42} color={colors.onPrimaryContainer} />
          </View>
        )}
        <View style={styles.mapTint} />
        {mapPhotoUrl ? (
          <MapMetaOverlay
            locationName={locationName}
            weatherTemperature={weatherTemperature}
            weatherWindSpeed={weatherWindSpeed}
            weatherCode={weatherCode}
          />
        ) : null}
      </View>

      <View style={styles.details}>
        <View style={styles.identityRow}>
          <UserAvatar
            size={42}
            profilePhoto={profile?.profilePhoto}
            name={profile?.name}
            surname={profile?.surname}
            placeholder={profile?.profilePhotoBlurhash}
            cachePolicy="disk"
            recyclingKey={profile?.profilePhoto}
            transition={0}
            testID="share-profile-avatar"
          />
          <View style={styles.identityCopy}>
            <View style={styles.activityTitleRow} testID="share-activity-title">
              <Icon source={getIconNameByTypeOfSport(sport)} size={16} color="rgba(255, 255, 255, 0.72)" />
              <Text numberOfLines={1} style={styles.activityTitle}>
                {activityLabel}
              </Text>
            </View>
            {formattedDate ? <Text style={styles.date}>{formattedDate}</Text> : null}
          </View>
          {emotionBadge && (
            <View style={styles.emotionIcon} testID="share-emotion-icon">
              <Icon source={emotionBadge.icon} size={28} color={emotionBadge.color} />
            </View>
          )}
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map(({ label, value }) => (
            <Metric key={label} label={label} value={value} />
          ))}
        </View>

        <View style={styles.footer}>
          <Image source={require('../../../assets/images/runich-logo.png')} style={styles.footerLogo} />
          <Text style={styles.footerBrand}>runich</Text>
        </View>
      </View>
    </View>
  );
}

function formatShareDate(date: string, duration: number, isRussian: boolean) {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return '';

  const end = new Date(start.getTime() + Math.max(0, duration));
  const locale = isRussian ? 'ru-RU' : 'en-US';
  const dateLabel = start.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (value: Date) =>
    value.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

  return `${dateLabel}, ${formatTime(start)}–${formatTime(end)}`;
}

const styles = StyleSheet.create({
  captureRoot: {
    backgroundColor: '#050506',
    height: SHARE_IMAGE_HEIGHT,
    left: -10000,
    overflow: 'hidden',
    position: 'absolute',
    top: -10000,
    width: SHARE_IMAGE_WIDTH,
    zIndex: -1,
  },
  mapSection: { height: SHARE_MAP_HEIGHT, position: 'relative', width: '100%' },
  map: { height: '100%', width: '100%' },
  mapFallback: { alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' },
  mapTint: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  details: { backgroundColor: '#050506', flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  identityRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  identityCopy: { flex: 1, minWidth: 0 },
  activityTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 8 },
  activityTitle: { color: '#FFFFFF', flex: 1, fontFamily: FONT_FAMILIES.semiBold, fontSize: 18 },
  date: { color: 'rgba(255, 255, 255, 0.68)', fontFamily: FONT_FAMILIES.medium, fontSize: 12, marginTop: 3 },
  emotionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginLeft: 8,
    width: 36,
  },
  metricsGrid: {
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    overflow: 'hidden',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 14,
    paddingTop: 14,
  },
  footerLogo: { borderRadius: 7, height: 24, width: 24 },
  footerBrand: { color: '#FFFFFF', fontFamily: FONT_FAMILIES.extraBold, fontSize: 17, letterSpacing: 0.4 },
});
