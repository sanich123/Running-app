import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
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
                backgroundColor: colors.background,
                borderColor: colors.outlineVariant,
              },
            ]}>
            <Text variant="bodyLarge" style={[styles.descriptionText, { color: colors.onBackground }]}>
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
