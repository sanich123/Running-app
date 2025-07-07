import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type MetricsItemProps = {
  isMapVisible: boolean;
  title: string;
  metric: string;
  isCentral: boolean;
};

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
      <Text variant={`${isCentralAndIsNotMapVisible ? 'displayMedium' : 'titleMedium'}`}>{title}</Text>
      <Text variant={`${isCentralAndIsNotMapVisible ? 'headlineLarge' : 'headlineSmall'}`}>{metric}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
