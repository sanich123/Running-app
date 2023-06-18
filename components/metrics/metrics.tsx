import { View } from '../Themed';
import Distance from './distance';
import LastKm from './last-km';
import Pace from './pace';
import Steps from './steps';
import Time from './time';
import { STATUSES } from '../../constants/enums';
import { metricsStyles } from './metrics-styles';

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
