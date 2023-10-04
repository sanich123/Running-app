import { useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import { ActivityComponentContext } from '../../utils/context/activity-component';
import { getSpeedInMinsInKm } from '../../utils/location-utils';
import { formatDuration } from '../../utils/time-formatter';
import MetricsItem from '../metrics-item/metrics-item';

export default function Metrics({ isMapVisible }: { isMapVisible: boolean }) {
  const { duration, distance } = useContext(ActivityComponentContext);
  const formattedDuration = formatDuration(duration);
  const formattedSpeed = distance && duration ? getSpeedInMinsInKm(distance, duration) : 0;
  const formattedDistance = (distance / 1000).toFixed(3);
  const { metricsLayout, withMapHeight } = styles;

  return (
    <View style={[metricsLayout, isMapVisible && withMapHeight]}>
      <>
        <MetricsItem isMapVisible={isMapVisible} title="Time:" metric={formattedDuration} isCentral={false} />
        {!isMapVisible && <MetricsItem isMapVisible={isMapVisible} title="Steps:" metric="12345" isCentral={false} />}
        <MetricsItem isMapVisible={isMapVisible} title="Pace:" metric={`${formattedSpeed}/km`} isCentral />
        {!isMapVisible && (
          <MetricsItem isMapVisible={isMapVisible} title="Last km:" metric="5.30 min/km" isCentral={false} />
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
