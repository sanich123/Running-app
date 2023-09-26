import { View, Text } from '@c/Themed';
import { STATUSES } from '@const/enums';
import { ActivityComponentContext } from '@u/context/activity-component';
import { useContext } from 'react';

import { metricsStyles } from '../metrics-styles';

export default function Distance() {
  const { mapVisible, distance, status } = useContext(ActivityComponentContext);
  const isStartedOrContinue = status === STATUSES.started || status === STATUSES.continue;
  const { basicWrapper, metricsWrapper, metricsHeader, metricsText } = metricsStyles;
  return (
    <View style={[basicWrapper, !mapVisible && isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>Distance: </Text>
      <Text style={metricsText}>{(distance / 1000).toFixed(3)} км</Text>
    </View>
  );
}
