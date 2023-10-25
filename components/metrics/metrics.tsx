import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration, formatDurationMinsSecs } from '../../utils/time-formatter';
import ActivityErrorMsg from '../activity-error-msg/activity-error-msg';
import MetricsItem from '../metrics-item/metrics-item';

export default function Metrics() {
  const { kilometresSplit, altitude, duration, distance, isMapVisible } = useSelector(({ location }) => location);
  const formattedDuration = formatDuration(duration);
  const formattedDistance = (distance / 1000).toFixed(2);
  const { metricsLayout, withMapHeight } = styles;
  const lastKmPace = kilometresSplit?.length > 0 ? kilometresSplit[kilometresSplit.length - 1] : 0;
  console.log(getSpeedInMinsInKm(distance, duration));
  return (
    <>
      <ActivityErrorMsg />
      <View style={[metricsLayout, isMapVisible && withMapHeight]}>
        <MetricsItem isMapVisible={isMapVisible} title="Time:" metric={formattedDuration} isCentral={false} />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title="Altitude:"
            metric={`${altitude.toFixed(2)} m`}
            isCentral={false}
          />
        )}
        <MetricsItem
          isMapVisible={isMapVisible}
          title="Pace:"
          metric={`${duration && distance ? getSpeedInMinsInKm(distance, duration).paceAsString : 0} /km`}
          isCentral
        />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title="Last km:"
            metric={formatDurationMinsSecs(lastKmPace.lastKilometerDuration)}
            isCentral={false}
          />
        )}
        <MetricsItem
          isMapVisible={isMapVisible}
          title="Distance:"
          metric={`${formattedDistance} km`}
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
