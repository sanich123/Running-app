import { StyleSheet, View } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

export default function MetricsItem({
  isMapVisible,
  title,
  metric,
  isCentral,
}: {
  isMapVisible: boolean;
  title: string;
  metric: string;
  isCentral: boolean;
}) {
  const { colors } = useTheme();
  const isCentralAndIsNotMapVisible = isCentral && !isMapVisible;
  return (
    <View
      style={[
        styles.basicMetricsLayout,
        {
          backgroundColor: colors.onSecondary,
          width: isCentralAndIsNotMapVisible ? '100%' : '50%',
        },
        isMapVisible && styles.isMapVisibleLayout,
      ]}>
      <Text
        variant={`${isCentralAndIsNotMapVisible ? 'displayLarge' : 'headlineSmall'}`}
        style={{ fontWeight: 'bold' }}>
        {title}
      </Text>
      <Text variant={`${isCentralAndIsNotMapVisible ? 'headlineLarge' : 'headlineMedium'}`}>{metric}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  basicMetricsLayout: {
    height: '33.33%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  isMapVisibleLayout: {
    width: '33.33%',
    height: '100%',
  },
});
