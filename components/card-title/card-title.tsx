import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function CardTitle({ title }: { title: string }) {
  return (
    <View
      style={{
        marginTop: 5,
        marginLeft: 15,
        marginBottom: 5,
      }}>
      <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
        {title}
      </Text>
    </View>
  );
}
