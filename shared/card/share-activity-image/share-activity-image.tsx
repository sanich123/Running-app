import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import UserAvatar from '@S/avatar/user-avatar/user-avatar';
import CustomImage from '@S/custom-image/custom-image';
import { getIconNameByTypeOfSport, MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { formatDuration } from '@U/time-formatter';
import { SHARE_IMAGE_WIDTH } from './const';
import Metric from './metric/metric';
import { formatShareDate } from './utils';
import MapMetaOverlay from '../map-meta-overlay/map-meta-overlay';
import { CARD_METRICS } from '../metrics/const';
import { getCardSpeedMetric } from '../metrics/utils';
import type { ShareActivityImageProps } from './types';

export default function ShareActivityImage({
  distance,
  duration,
  date,
  title,
  mapPhotoUrl,
  mapPhotoUrlBlurhash,
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
  caloriesActive,
}: ShareActivityImageProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const isRussian = language === LANGUAGES.russian;
  const speedMetric = getCardSpeedMetric({ sport, distance, duration, language });
  const sportTitle = MAP_SPORT_TO_TITLE[sport as keyof typeof MAP_SPORT_TO_TITLE]?.[language] ?? sport;
  const formattedDate = formatShareDate(date, duration, isRussian);
  const activityLabel = title || sportTitle;
  const metrics = [
    { label: CARD_METRICS[language].time, value: formatDuration(duration) },
    { label: CARD_METRICS[language].distance, value: `${(distance / 1000).toFixed(2)} ${CARD_METRICS[language].km}` },
    { label: speedMetric.title, value: speedMetric.metrics },
    ...(elevationGain && elevationGain > 0
      ? [{ label: CARD_METRICS[language].elevation, value: `${Math.round(elevationGain)} ${CARD_METRICS[language].m}` }]
      : []),
    ...(steps != null && steps > 1 ? [{ label: CARD_METRICS[language].steps, value: `${steps}` }] : []),
    ...(caloriesActive != null
      ? [{ label: CARD_METRICS[language].calories, value: `${caloriesActive} ${CARD_METRICS[language].kcal}` }]
      : []),
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
      <View style={styles.mapSection} testID="share-map-section">
        {mapPhotoUrl ? (
          <CustomImage
            style={styles.map}
            source={{ uri: mapPhotoUrl }}
            contentFit="cover"
            placeholder={mapPhotoUrlBlurhash}
            priority="low"
            cachePolicy="disk"
            recyclingKey={mapPhotoUrl}
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
            emotion={emotion}
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
        </View>

        <View style={styles.metricsGrid} testID="share-metrics-grid">
          {metrics.map(({ label, value }) => (
            <Metric key={label} label={label} value={value} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  captureRoot: {
    backgroundColor: '#050506',
    left: -10000,
    overflow: 'hidden',
    position: 'absolute',
    top: -10000,
    width: SHARE_IMAGE_WIDTH,
    zIndex: -1,
  },
  mapSection: { aspectRatio: 5 / 3, position: 'relative', width: '100%' },
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
  details: { backgroundColor: '#050506', paddingBottom: 16, paddingHorizontal: 16, paddingTop: 16 },
  identityRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  identityCopy: { flex: 1, minWidth: 0 },
  activityTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 5, minHeight: 22 },
  activityTitle: { color: '#FFFFFF', flex: 1, fontFamily: FONT_FAMILIES.semiBold, fontSize: 18 },
  date: { color: 'rgba(255, 255, 255, 0.68)', fontFamily: FONT_FAMILIES.medium, fontSize: 12, marginTop: 3 },
  metricsGrid: {
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    overflow: 'hidden',
  },
});
