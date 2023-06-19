import { View, Text } from '../../Themed';
import { metricsStyles } from '../metrics-styles';

export default function LastKm({ isStartedOrContinue }: { isStartedOrContinue: boolean }) {
  const { basicWrapper, metricsWrapper, metricsHeader } = metricsStyles;
  return (
    <View style={[basicWrapper, isStartedOrContinue && metricsWrapper]}>
      <Text style={metricsHeader}>To do: last km section</Text>
    </View>
  );
}
