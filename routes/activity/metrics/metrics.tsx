import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { formatDuration } from '@U/time-formatter';
import { MAP_METRICS } from './const';
import { getLiveLastKmMetric, getLiveMainMetric, getLiveTopMetric } from './utils';
import { useActivitySportParams } from '../activity-params';
import ActivityErrorMsg from '../error-msg/error-msg';
import MetricsItem from './metrics-item/metrics-item';

export default function Metrics() {
  const { colors } = useTheme();
  const { kilometresSplit, altitude, duration, distance, steps, isMapVisible } = useAppSelector(
    ({ location }) => location,
  );
  const { language } = useAppSelector(({ settings }) => settings);
  const { sport } = useActivitySportParams();
  const formattedDuration = formatDuration(duration);
  const formattedDistance = (distance / 1000).toFixed(2);
  const lastKmSplit = kilometresSplit?.length > 0 ? kilometresSplit[kilometresSplit.length - 1] : undefined;
  const primaryMetric = getLiveMainMetric({ sport, distance, duration, language });
  const lastKmMetric = getLiveLastKmMetric({ sport, split: lastKmSplit, language });
  const topMetric = getLiveTopMetric({ sport, altitude, steps, language });

  return (
    <>
      <ActivityErrorMsg />
      <View style={[styles.layout, { backgroundColor: colors.surfaceVariant, height: isMapVisible ? '12%' : '100%' }]}>
        <MetricsItem
          isMapVisible={isMapVisible}
          title={`${MAP_METRICS[language].time}:`}
          metric={formattedDuration}
          isCentral={false}
        />
        {!isMapVisible && (
          <MetricsItem isMapVisible={isMapVisible} title={`${topMetric.title}:`} metric={topMetric.metric} isCentral={false} />
        )}
        <MetricsItem isMapVisible={isMapVisible} title={primaryMetric.title + ':'} metric={primaryMetric.metric} isCentral />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title={`${MAP_METRICS[language].lastKm}:`}
            metric={lastKmMetric}
            isCentral={false}
          />
        )}
        <MetricsItem
          isMapVisible={isMapVisible}
          title={`${MAP_METRICS[language].distance}:`}
          metric={`${formattedDistance} ${`${MAP_METRICS[language].km}`}`}
          isCentral={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  layout: {
    alignContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    position: 'relative',
    paddingTop: 10,
    paddingBottom: 6,
    transform: Platform.OS === 'ios' ? [{ translateY: 4 }] : undefined,
  },
});
