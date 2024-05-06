import CardTitle from '@C/card-title/card-title';
import ShowMetrics from '@C/show-metrics/show-metrics';
import { useAppSelector } from '@R/typed-hooks';
import { getSpeedInMinsInKm } from '@U/location-utils';
import { formatDuration } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { CARD_METRICS } from './const';

export default memo(function CardMetrics({
  distance,
  duration,
  title,
  isShowDescription,
  description,
  userId,
  id,
}: {
  distance: number;
  duration: number;
  title: string;
  isShowDescription: boolean;
  description: string;
  userId: string;
  id: string;
}) {
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple
      rippleColor="rgba(0, 0, 0, .08)"
      onPress={() => {
        if (!pathname.includes(ROUTES.activity)) {
          push(`/${place}/${ROUTES.activity}/${id}?userId=${userId}`);
        }
      }}>
      <>
        {title ? <CardTitle title={title} /> : null}
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
    marginBottom: 5,
  },
});
