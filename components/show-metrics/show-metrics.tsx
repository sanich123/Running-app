import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ShowMetrics({ title, metrics }: { title: string; metrics: string }) {
  return (
    <View>
      <Text variant="bodySmall">{title}</Text>
      <Text variant="titleLarge">{metrics}</Text>
    </View>
  );
}
