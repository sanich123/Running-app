import ShowMetrics from '@C/show-metrics/show-metrics';
import { getSpeedInMinsInKm } from '@U/location-utils';
import { formatDuration } from '@U/time-formatter';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { CARD_METRICS } from './const';

export default function CardMetrics({ distance, duration }: { distance: number; duration: number }) {
  const { language } = useSelector(({ language }) => language);
  return (
    <View style={styles.metricsWrapper}>
      <ShowMetrics
        title={`${CARD_METRICS[language as keyof typeof CARD_METRICS].time}: `}
        metrics={`${formatDuration(duration)}`}
      />
      <ShowMetrics
        title={`${CARD_METRICS[language as keyof typeof CARD_METRICS].pace}: `}
        metrics={`${getSpeedInMinsInKm(distance, duration).paceAsString} /${
          CARD_METRICS[language as keyof typeof CARD_METRICS].km
        }`}
      />
      <ShowMetrics
        title={`${CARD_METRICS[language as keyof typeof CARD_METRICS].distance}: `}
        metrics={`${(distance / 1000).toFixed(2)} ${CARD_METRICS[language as keyof typeof CARD_METRICS].km}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  metricsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 15,
    columnGap: 15,
    marginBottom: 5,
  },
});
