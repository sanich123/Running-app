import { useContext } from 'react';

import { STATUSES } from '../../../constants/enums';
import { ActivityComponentContext } from '../../../utils/context/activity-component';
import { formatDuration } from '../../../utils/time-formatter';
import { View, Text } from '../../Themed';
import { metricsStyles } from '../metrics-styles';

const { started, continued } = STATUSES;

export default function Time() {
  const { mapVisible, status, duration } = useContext(ActivityComponentContext);
  const isStartedOrContinue = status === started || status === continued;
  const { basicWrapper, metricsWrapper, metricsHeader, metricsText } = metricsStyles;
  return (
    <View style={[basicWrapper, !mapVisible && isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>Time: </Text>
      <Text style={metricsText}>{formatDuration(duration)}</Text>
    </View>
  );
}
