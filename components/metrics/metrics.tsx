import { useAppSelector } from '@R/typed-hooks';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { MAP_METRICS } from './const';
import { getSpeedInMinsInKm } from '../../utils/location/location-utils';
import { formatDuration, formatDurationMinsSecs } from '../../utils/time-formatter';
import ActivityErrorMsg from '../activity/error-msg/error-msg';
import MetricsItem from '../metrics-item/metrics-item';

export default function Metrics() {
  const { colors } = useTheme();
  const { kilometresSplit, altitude, duration, distance, isMapVisible } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const formattedDuration = formatDuration(duration);
  const formattedDistance = (distance / 1000).toFixed(2);
  const lastKmPace = kilometresSplit?.length > 0 ? kilometresSplit[kilometresSplit.length - 1] : 0;

  return (
    <>
      <ActivityErrorMsg />
      <View style={[styles.layout, { backgroundColor: colors.surfaceVariant, height: isMapVisible ? '20%' : '100%' }]}>
        <MetricsItem
          isMapVisible={isMapVisible}
          title={`${MAP_METRICS[language].time}:`}
          metric={formattedDuration}
          isCentral={false}
        />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title={`${MAP_METRICS[language].altitude}:`}
            metric={`${altitude.toFixed(2)} ${`${MAP_METRICS[language].m}`}`}
            isCentral={false}
          />
        )}
        <MetricsItem
          isMapVisible={isMapVisible}
          title={`${MAP_METRICS[language].pace}:`}
          metric={`${
            duration && distance ? getSpeedInMinsInKm(distance, duration).paceAsString : 0
          } /${`${MAP_METRICS[language].km}`}`}
          isCentral
        />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title={`${MAP_METRICS[language].lastKm}:`}
            metric={formatDurationMinsSecs(lastKmPace ? lastKmPace.lastKilometerDuration : 0)}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    position: 'relative',
  },
});
