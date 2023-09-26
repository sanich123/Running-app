import { View, Text } from '@c/Themed';
import { STATUSES } from '@const/enums';
import { ActivityComponentContext } from '@u/context/activity-component';
import { formatDuration } from '@u/time-formatter';
import { useContext } from 'react';

import { metricsStyles } from '../metrics-styles';

export default function Time() {
  const { mapVisible, status, duration } = useContext(ActivityComponentContext);
  const isStartedOrContinue = status === STATUSES.started || status === STATUSES.continue;
  const { basicWrapper, metricsWrapper, metricsHeader, metricsText } = metricsStyles;
  return (
    <View style={[basicWrapper, !mapVisible && isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>Time: </Text>
      <Text style={metricsText}>{formatDuration(duration)}</Text>
    </View>
  );
}
