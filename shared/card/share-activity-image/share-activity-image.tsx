import type { MutableRefObject } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { CustomImage } from '@S/custom-image/custom-image';
import { getSpeedInMinsInKm } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import { CARD_METRICS } from '../metrics/const';
import type { ActivityCardProps } from '../types';

const SHARE_IMAGE_SIZE = 360;

export default function ShareActivityImage({
  distance,
  duration,
  date,
  title,
  mapPhotoUrl,
  cardRef,
}: Pick<ActivityCardProps, 'distance' | 'duration' | 'date' | 'title' | 'mapPhotoUrl'> & {
  cardRef: MutableRefObject<View | null>;
}) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const isRussian = language === LANGUAGES.russian;
  const pace = getSpeedInMinsInKm(distance, duration);
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
        <CustomImage style={styles.map} source={{ uri: mapPhotoUrl }} contentFit="cover" testID={mapPhotoUrl} />
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
        <View style={[styles.footerAccent, { backgroundColor: colors.primary }]} />
        <View style={styles.metricsWrapper}>
          <Metric label={CARD_METRICS[language].pace} value={`${pace.paceAsString} /${CARD_METRICS[language].km}`} />
          <Metric label={CARD_METRICS[language].time} value={formatDuration(duration)} />
          <Metric
            label={CARD_METRICS[language].distance}
            value={`${(distance / 1000).toFixed(2)} ${CARD_METRICS[language].km}`}
          />
        </View>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.metricLabel}>
        {label}
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
    backgroundColor: 'rgba(38, 38, 38, 0.16)',
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
    color: '#FFFFFF',
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 13,
  },
  routeLabel: {
    alignItems: 'center',
    backgroundColor: 'rgba(38, 38, 38, 0.68)',
    borderRadius: 18,
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
    backgroundColor: 'rgba(38, 38, 38, 0.9)',
    bottom: 0,
    left: 0,
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  footerAccent: {
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    width: 42,
  },
  metricsWrapper: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metric: {
    flex: 1,
    minWidth: 0,
  },
  metricValue: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 17,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 10,
    marginTop: 3,
  },
});
