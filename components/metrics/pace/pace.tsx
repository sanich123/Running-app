import { View, Text } from '@c/Themed';
import { STATUSES } from '@const/enums';
import { ActivityComponentContext } from '@u/context/activity-component';
import { getTotalSpeed } from '@u/location-utils';
import { useContext } from 'react';

import { metricsStyles } from '../metrics-styles';

export default function Pace() {
  const { mapVisible, distance, duration, status } = useContext(ActivityComponentContext);
  const isStartedOrContinue = status === STATUSES.started || status === STATUSES.continue;
  const { basicWrapper, metricsWrapper, metricsHeader, metricsText, bigPace, bigHeader } = metricsStyles;
  return (
    <View style={[basicWrapper, !mapVisible && isStartedOrContinue && metricsWrapper && bigPace]}>
      <Text style={metricsHeader}>Pace: </Text>
      <Text style={[metricsText, !mapVisible && isStartedOrContinue && bigHeader]}>
        {distance && duration ? getTotalSpeed(distance, duration) : 0} км/ч
      </Text>
    </View>
  );
}
