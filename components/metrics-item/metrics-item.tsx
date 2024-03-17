import { View } from 'react-native';
import { Text } from 'react-native-paper';

type MetricsItemProps = {
  isMapVisible: boolean;
  title: string;
  metric: string;
  isCentral: boolean;
};

export default function MetricsItem({ isMapVisible, title, metric, isCentral }: MetricsItemProps) {
  const isCentralAndIsNotMapVisible = isCentral && !isMapVisible;
  console.log(isCentralAndIsNotMapVisible);
  return (
    <View
      className={`flex items-center justify-center ${isCentralAndIsNotMapVisible ? 'w-full' : 'w-1/2'} ${isMapVisible ? 'w-1/3 h-full' : 'h-1/3'}`}>
      <Text variant={`${isCentralAndIsNotMapVisible ? 'displayMedium' : 'headlineSmall'}`}>{title}</Text>
      <Text variant={`${isCentralAndIsNotMapVisible ? 'headlineLarge' : 'headlineSmall'}`}>{metric}</Text>
    </View>
  );
}
