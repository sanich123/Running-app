import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { MetricsItemProps } from './types';

export default function MetricsItem({ isMapVisible, title, metric, isCentral }: MetricsItemProps) {
  const isCentralAndIsNotMapVisible = isCentral && !isMapVisible;
  return (
    <View
      style={[
        styles.layout,
        {
          width: isCentralAndIsNotMapVisible ? '100%' : isMapVisible ? '33.3%' : '50%',
          height: isMapVisible ? '100%' : '30%',
        },
      ]}>
      <Text
        variant={`${isCentralAndIsNotMapVisible ? 'titleMedium' : 'bodySmall'}`}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={{ fontSize: isCentralAndIsNotMapVisible ? 16 : 15 }}>
        {title}
      </Text>
      <Text
        variant={`${isCentralAndIsNotMapVisible ? 'headlineMedium' : 'titleLarge'}`}
        numberOfLines={1}
        adjustsFontSizeToFit={false}
        minimumFontScale={1}
        style={[
          styles.metricValue,
          {
            fontSize: isMapVisible ? 22 : 26,
          },
        ]}>
        {metric}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    lineHeight: 30,
    marginTop: 6,
  },
});
