import type { MutableRefObject } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import CustomImage from '@S/custom-image/custom-image';
import { formatDuration } from '@U/time-formatter';
import { SHARE_IMAGE_SIZE } from './const';
import Metric from './metric';
import { CARD_METRICS } from '../metrics/const';
import { getCardSpeedMetric } from '../metrics/utils';
import { getShareMapPhotoUrl } from '../utils';
import type { ActivityCardProps } from '../types';

export default function ShareActivityImage({
  distance,
  duration,
  date,
  title,
  mapPhotoUrl,
  cardRef,
  sport = 'run',
}: Pick<ActivityCardProps, 'distance' | 'duration' | 'date' | 'title' | 'mapPhotoUrl'> & {
  sport?: string;
  cardRef: MutableRefObject<View | null>;
}) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const isRussian = language === LANGUAGES.russian;
  const shareMapPhotoUrl = getShareMapPhotoUrl(mapPhotoUrl) ?? mapPhotoUrl;
  const speedMetric = getCardSpeedMetric({ sport, distance, duration, language });
  const formattedDate = Number.isNaN(new Date(date).getTime())
    ? ''
    : new Date(date).toLocaleDateString(isRussian ? 'ru-RU' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  return (
    <View ref={cardRef} collapsable={false} style={styles.captureRoot}>
      {mapPhotoUrl ? (
        <CustomImage
          style={styles.map}
          source={{ uri: shareMapPhotoUrl }}
          contentFit="cover"
          priority="low"
          cachePolicy="disk"
          recyclingKey={shareMapPhotoUrl}
          testID={mapPhotoUrl}
        />
      ) : (
        <View style={[styles.mapFallback, { backgroundColor: colors.primaryContainer }]} />
      )}
      <View style={styles.mapTint} />

      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../../assets/images/runich-logo.png')} style={styles.logo} />
          <Text style={styles.brandName}>runich</Text>
        </View>
        {formattedDate ? <Text style={styles.date}>{formattedDate}</Text> : null}
      </View>

      <View style={styles.routeLabel}>
        <Icon source="map-marker-path" size={16} color="#FFFFFF" />
        <Text numberOfLines={1} style={styles.routeTitle}>
          {title || (isRussian ? 'Активность' : 'Activity')}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.metricsWrapper}>
          <Metric label={speedMetric.title} value={speedMetric.metrics} />
          <Metric label={CARD_METRICS[language].time} value={formatDuration(duration)} />
          <Metric
            label={CARD_METRICS[language].distance}
            value={`${(distance / 1000).toFixed(2)} ${CARD_METRICS[language].km}`}
          />
        </View>
      </View>
      <Text numberOfLines={1} style={styles.attribution}>
        © Mapbox · © OpenStreetMap · Improve this map
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  captureRoot: {
    height: SHARE_IMAGE_SIZE,
    opacity: 0,
    position: 'absolute',
    width: SHARE_IMAGE_SIZE,
    zIndex: -1,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  mapFallback: {
    height: '100%',
    width: '100%',
  },
  mapTint: {
    backgroundColor: 'rgba(38, 38, 38, 0.05)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 16,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logo: {
    borderRadius: 10,
    height: 38,
    width: 38,
  },
  brandName: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 20,
    letterSpacing: 0.4,
  },
  date: {
    backgroundColor: 'rgba(30, 32, 36, 0.32)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    borderWidth: 1,
    color: '#FFFFFF',
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 13,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  routeLabel: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 32, 36, 0.36)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    left: 16,
    maxWidth: SHARE_IMAGE_SIZE - 32,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    top: 72,
  },
  routeTitle: {
    color: '#FFFFFF',
    flexShrink: 1,
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 12,
  },
  footer: {
    bottom: 14,
    left: 14,
    position: 'absolute',
    right: 14,
  },
  metricsWrapper: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  attribution: {
    bottom: 3,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 6,
    left: 16,
    lineHeight: 8,
    position: 'absolute',
    right: 16,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
