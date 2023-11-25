import ShowMetrics from '@C/show-metrics/show-metrics';
import { useAppSelector } from '@R/typed-hooks';
import { getSpeedInMinsInKm } from '@U/location-utils';
import { formatDuration } from '@U/time-formatter';
import { View, StyleSheet } from 'react-native';

import { CARD_METRICS } from './const';

export default function CardMetrics({ distance, duration }: { distance: number; duration: number }) {
  const { language } = useAppSelector(({ language }) => language);
  return (
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
