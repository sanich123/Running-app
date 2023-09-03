import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ShowMetrics({ title, metrics }: { title: string; metrics: string }) {
  return (
    <View style={{ display: 'flex' }}>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodyMedium">{metrics}</Text>
    </View>
  );
}
