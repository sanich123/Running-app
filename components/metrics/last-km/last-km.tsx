import { View, Text } from '@c/Themed';
import { STATUSES } from '@const/enums';
import { ActivityComponentContext } from '@u/context/activity-component';
import { useContext } from 'react';

import { metricsStyles } from '../metrics-styles';

export default function LastKm() {
  const { status } = useContext(ActivityComponentContext);
  const isStartedOrContinue = status === STATUSES.started || status === STATUSES.continue;
  const { basicWrapper, metricsWrapper, metricsHeader } = metricsStyles;

  return (
    <View style={[basicWrapper, isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>To do: last km section</Text>
    </View>
  );
}
