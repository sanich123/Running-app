import { useContext } from 'react';
import { View } from 'react-native';

import { STATUSES } from '../../constants/enums';
import { ActivityComponentContext } from '../../utils/context/activity-component';
import { getTotalSpeed } from '../../utils/location-utils';
import { formatDuration } from '../../utils/time-formatter';
import MetricsItem from '../metrics-item/metrics-item';

export default function Metrics({ isMapVisible }: { isMapVisible: boolean }) {
  const { status, duration, distance } = useContext(ActivityComponentContext);
  const formattedDuration = formatDuration(duration);
  const formattedSpeed = distance && duration ? getTotalSpeed(distance, duration) : 0;
  const formattedDistance = (distance / 1000).toFixed(3);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          height: '100%',
        },
        { backgroundColor: 'yellow' },
        status === STATUSES.paused && {
          height: '100%',
        },
        isMapVisible && {
          height: '15%',
        },
      ]}>
      <>
        <MetricsItem isMapVisible={isMapVisible} title="Time:" metric={formattedDuration} isCentral={false} />
        {!isMapVisible && <MetricsItem isMapVisible={isMapVisible} title="Steps:" metric="12345" isCentral={false} />}
        <MetricsItem isMapVisible={isMapVisible} title="Pace:" metric={`${formattedSpeed} км/ч`} isCentral />
        {!isMapVisible && (
          <MetricsItem isMapVisible={isMapVisible} title="Last km:" metric="5.30 min/km" isCentral={false} />
        )}
        <MetricsItem isMapVisible={isMapVisible} title="Distance:" metric={formattedDistance} isCentral={false} />
      </>
    </View>
  );
}
