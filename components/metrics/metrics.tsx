import { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { ActivityComponentContext } from '../../utils/context/activity-component';
// import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration, formatDurationInMinsSecs } from '../../utils/time-formatter';
import MetricsItem from '../metrics-item/metrics-item';

export default function Metrics({ isMapVisible }: { isMapVisible: boolean }) {
  const { duration, distance } = useContext(ActivityComponentContext);
  const formattedDuration = formatDuration(duration);
  const formattedDistance = (distance / 1000).toFixed(3);
  const { metricsLayout, withMapHeight } = styles;
  const { currentPace, kilometresSplit, altitude } = useSelector(({ location }) => location);
  const lastKmPace = kilometresSplit?.length > 0 ? kilometresSplit[kilometresSplit.length - 1] : 0;

  return (
    <View style={[metricsLayout, isMapVisible && withMapHeight]}>
      <>
        <MetricsItem isMapVisible={isMapVisible} title="Time:" metric={formattedDuration} isCentral={false} />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title="Altitude:"
            metric={`${altitude.toFixed(2)} m`}
            isCentral={false}
          />
        )}
        <MetricsItem isMapVisible={isMapVisible} title="Pace:" metric={`${currentPace}/km`} isCentral />
        {!isMapVisible && (
          <MetricsItem
            isMapVisible={isMapVisible}
            title="Last km:"
            metric={formatDurationInMinsSecs(lastKmPace.lastKilometerDuration)}
            isCentral={false}
          />
        )}
        <MetricsItem
          isMapVisible={isMapVisible}
          title="Distance:"
          metric={`${formattedDistance} km`}
          isCentral={false}
        />
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    height: '100%',
  },
  withMapHeight: {
    height: '15%',
  },
});
