import { useContext } from 'react';

import { STATUSES } from '../../../constants/enums';
import { ActivityComponentContext } from '../../../utils/context/activity-component';
import { View, Text } from '../../Themed';
import { metricsStyles } from '../metrics-styles';

const { started, continued } = STATUSES;

export default function LastKm() {
  const { status } = useContext(ActivityComponentContext);
  const isStartedOrContinue = status === started || status === continued;
  const { basicWrapper, metricsWrapper, metricsHeader } = metricsStyles;

  return (
    <View style={[basicWrapper, isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>To do: last km section</Text>
    </View>
  );
}
