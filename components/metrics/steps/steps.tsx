import { View, Text } from '@c/Themed';

import { metricsStyles } from '../metrics-styles';

export default function Steps() {
  const { metricsWrapper, metricsHeader, metricsText } = metricsStyles;
  return (
    <View style={metricsWrapper}>
      <Text style={metricsHeader}>Steps: </Text>
      <Text style={metricsText}>12345 per/minute</Text>
    </View>
  );
}
