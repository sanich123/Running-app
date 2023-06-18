import { formatDuration } from '../../utils/time-formatter';
import { View, Text } from '../Themed';
import { metricsStyles } from './metrics-styles';

type TimeProps = {
  mapVisible: boolean;
  isStartedOrContinue: boolean;
  duration: number;
};

export default function Time({ mapVisible, isStartedOrContinue, duration }: TimeProps) {
  const { basicWrapper, metricsWrapper, metricsHeader, metricsText } = metricsStyles;
  return (
    <View style={[basicWrapper, !mapVisible && isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>Time: </Text>
      <Text style={metricsText}>{formatDuration(duration)}</Text>
    </View>
  );
}
