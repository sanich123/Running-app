import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ActivityCardDesription({ description }: { description: string }) {
  return (
    <View>
      <Text variant="bodyLarge">{description}</Text>
    </View>
  );
}
