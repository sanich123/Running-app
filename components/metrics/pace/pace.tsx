import { View, Text } from '../../Themed';
import { metricsStyles } from '../metrics-styles';

type PaceProps = {
  mapVisible: boolean;
  isStartedOrContinue: boolean;
  velocity: number;
};

export default function Pace({ mapVisible, isStartedOrContinue, velocity }: PaceProps) {
  const { basicWrapper, metricsWrapper, metricsHeader, metricsText, bigPace, bigHeader } = metricsStyles;
  return (
    <View style={[basicWrapper, !mapVisible && isStartedOrContinue && metricsWrapper && bigPace]}>
      <Text style={metricsHeader}>Pace: </Text>
      <Text style={[metricsText, !mapVisible && isStartedOrContinue && bigHeader]}>{velocity} мин/км</Text>
    </View>
  );
}
