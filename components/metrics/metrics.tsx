import Distance from './distance/distance';
import LastKm from './last-km/last-km';
import { metricsStyles } from './metrics-styles';
import Pace from './pace/pace';
import Steps from './steps/steps';
import Time from './time/time';
import { STATUSES } from '../../constants/enums';
import { View } from '../Themed';

type MetricsProps = {
  velocity: number;
  distance: number;
  duration: number;
  status: STATUSES;
  mapVisible: boolean;
};

export default function Metrics({ velocity, distance, duration, status, mapVisible }: MetricsProps) {
  const { containerMetrics } = metricsStyles;
  const isStartedOrContinue = status === STATUSES.started || status === STATUSES.continue;

  return (
    <View style={[containerMetrics, isStartedOrContinue && { height: '80%' }, mapVisible && { height: '15%' }]}>
      <Time isStartedOrContinue={isStartedOrContinue} mapVisible={mapVisible} duration={duration} />
      {!mapVisible && isStartedOrContinue && <Steps />}
      <Pace isStartedOrContinue={isStartedOrContinue} mapVisible={mapVisible} velocity={velocity} />
      {!mapVisible && isStartedOrContinue && <LastKm isStartedOrContinue={isStartedOrContinue} />}
      <Distance isStartedOrContinue={isStartedOrContinue} mapVisible={mapVisible} distance={distance} />
    </View>
  );
}
