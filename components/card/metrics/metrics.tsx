import ShowMetrics from '@C/show-metrics/show-metrics';
import { useAppSelector } from '@R/typed-hooks';
import { getSpeedInMinsInKm } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { Href, usePathname, useRouter } from 'expo-router';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { CARD_METRICS } from './const';
import { MetricsProps } from '../types';

export default memo(function Metrics({
  distance,
  duration,
  title,
  isShowDescription,
  description,
  userId,
  id,
}: MetricsProps) {
  const { dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile)
    ? ROUTES.profile
    : pathname.includes(ROUTES.home)
      ? ROUTES.home
      : ROUTES.statistic;
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => {
        if (!pathname.includes(ROUTES.activity)) {
          push(`/${place}/${ROUTES.activity}/${id}?userId=${userId}` as Href);
        }
      }}
      borderless
      style={{ paddingLeft: 5, paddingVertical: 2 }}>
      <>
        {title ? (
          <Text variant="titleLarge" style={styles.title}>
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
          <Text variant="bodyLarge" style={{ marginBottom: 5 }}>
            {description}
          </Text>
        ) : null}
      </>
    </TouchableRipple>
  );
});

const styles = StyleSheet.create({
  metricsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 15,
    marginVertical: 3,
  },
  title: {
    fontWeight: 'bold',
    marginVertical: 5,
  },
});
