import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import ShowMetrics from '@S/card/show-metrics/show-metrics';
import { getSpeedInMinsInKm } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import { CARD_METRICS } from './const';
import type { MetricsProps } from '../types';

export default memo(function Metrics({
  distance,
  duration,
  title,
  isShowDescription,
  description,
  userId,
  id,
}: MetricsProps) {
  const { colors, dark } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const pathname = usePathname();

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => {
        if (pathname !== `/activity/${id}`) {
          push(`/${ROUTES.activity}/${id}?userId=${userId}`);
        }
      }}
      borderless
      style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
      <>
        {title ? (
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
        ) : null}
        <View style={styles.metricsWrapper}>
          <ShowMetrics title={`${CARD_METRICS[language].time}: `} metrics={`${formatDuration(duration)}`} />
          <ShowMetrics
            title={`${CARD_METRICS[language].pace}: `}
            metrics={`${getSpeedInMinsInKm(distance, duration).paceAsString} /${CARD_METRICS[language].km}`}
          />
          <ShowMetrics
            title={`${CARD_METRICS[language].distance}: `}
            metrics={`${(distance / 1000).toFixed(2)} ${CARD_METRICS[language].km}`}
          />
        </View>
        {isShowDescription ? (
          <View
            style={[
              styles.descriptionCard,
              {
                backgroundColor: colors.primaryContainer,
                borderColor: colors.outlineVariant,
                borderLeftColor: colors.primary,
              },
            ]}>
            <View style={styles.descriptionHeader}>
              <Icon source="text-box-outline" size={19} color={colors.primary} />
              <Text variant="labelLarge" style={[styles.descriptionLabel, { color: colors.primary }]}>
                {CARD_METRICS[language].description}
              </Text>
            </View>
            <Text variant="bodyLarge" style={[styles.descriptionText, { color: colors.onSurfaceVariant }]}>
              {description}
            </Text>
          </View>
        ) : null}
      </>
    </TouchableRipple>
  );
});

const styles = StyleSheet.create({
  metricsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 20,
    marginTop: 6,
  },
  title: {
    fontFamily: FONT_FAMILIES.semiBold,
    marginBottom: 2,
  },
  descriptionCard: {
    borderLeftWidth: 3,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  descriptionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 5,
  },
  descriptionLabel: {
    fontFamily: FONT_FAMILIES.semiBold,
    letterSpacing: 0.4,
  },
  descriptionText: {
    lineHeight: 23,
  },
});
