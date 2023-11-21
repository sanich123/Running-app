import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { MAP_METRICS } from './const';
import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration, formatDurationMinsSecs } from '../../utils/time-formatter';
import ActivityErrorMsg from '../activity-error-msg/activity-error-msg';
import MetricsItem from '../metrics-item/metrics-item';

export default function Metrics() {
  const { kilometresSplit, altitude, duration, distance, isMapVisible } = useSelector(({ location }) => location);
  const { language } = useSelector(({ language }) => language);
  const formattedDuration = formatDuration(duration);
  const formattedDistance = (distance / 1000).toFixed(2);
  const { metricsLayout, withMapHeight } = styles;
  const lastKmPace = kilometresSplit?.length > 0 ? kilometresSplit[kilometresSplit.length - 1] : 0;

  return (
    <>
      <ActivityErrorMsg />
      <View style={[metricsLayout, isMapVisible && withMapHeight]}>
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
            metric={formatDurationMinsSecs(lastKmPace.lastKilometerDuration)}
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
  metricsLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    height: '100%',
    position: 'relative',
  },
  withMapHeight: {
    height: '15%',
  },
});
