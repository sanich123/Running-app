import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { CARD_METRICS } from './const';
import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration } from '../../utils/time-formatter';
import ShowMetrics from '../show-metrics/show-metrics';

export default function CardMetrics({ distance, duration }: { distance: number; duration: number }) {
  const { language } = useSelector(({ language }) => language);
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
