import { useContext } from 'react';

import { STATUSES } from '../../../constants/enums';
import { ActivityComponentContext } from '../../../utils/context/activity-component';
import { View, Text } from '../../Themed';
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
