import { View } from '@c/Themed';
import { STATUSES } from '@const/enums';
import { ActivityComponentContext } from '@u/context/activity-component';
import { useContext } from 'react';

import Distance from './distance/distance';
import LastKm from './last-km/last-km';
import { metricsStyles } from './metrics-styles';
import Pace from './pace/pace';
import Steps from './steps/steps';
import Time from './time/time';

export default function Metrics() {
  const { status, mapVisible } = useContext(ActivityComponentContext);
  const { containerMetrics } = metricsStyles;
  const isStartedOrContinue = status === STATUSES.started || status === STATUSES.continue;

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
