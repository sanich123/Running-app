import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface MetricsItemProps {
  isMapVisible: boolean;
  title: string;
  metric: string;
  isCentral: boolean;
}

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
        minimumFontScale={0.7}>
        {title}
      </Text>
      <Text
        variant={`${isCentralAndIsNotMapVisible ? 'headlineMedium' : 'titleLarge'}`}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
        style={styles.metricValue}>
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
  },
});
