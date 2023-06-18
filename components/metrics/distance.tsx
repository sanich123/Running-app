import { View, Text } from '../Themed';
import { metricsStyles } from './metrics-styles';

type DistanceProps = {
  mapVisible: boolean;
  isStartedOrContinue: boolean;
  distance: number;
};

export default function Distance({ mapVisible, isStartedOrContinue, distance }: DistanceProps) {
  const { basicWrapper, metricsWrapper, metricsHeader, metricsText } = metricsStyles;
  return (
    <View style={[basicWrapper, !mapVisible && isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>Distance: </Text>
      <Text style={metricsText}>{(distance / 1000).toFixed(3)} км</Text>
    </View>
  );
}
