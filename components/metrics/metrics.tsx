import { useContext } from 'react';

import Distance from './distance/distance';
import LastKm from './last-km/last-km';
import { metricsStyles } from './metrics-styles';
import Pace from './pace/pace';
import Steps from './steps/steps';
import Time from './time/time';
import { STATUSES } from '../../constants/enums';
import { ActivityComponentContext } from '../../utils/context/activity-component';
import { View } from '../Themed';

const { started, continued } = STATUSES;

export default function Metrics() {
  const { status, mapVisible } = useContext(ActivityComponentContext);
  const { containerMetrics } = metricsStyles;
  const isStartedOrContinue = status === started || status === continued;

  return (
    <View style={[containerMetrics, isStartedOrContinue && { height: '80%' }, mapVisible && { height: '15%' }]}>
      <Time />
      {!mapVisible && isStartedOrContinue && <Steps />}
      <Pace />
      {!mapVisible && isStartedOrContinue && <LastKm />}
      <Distance />
    </View>
  );
}
