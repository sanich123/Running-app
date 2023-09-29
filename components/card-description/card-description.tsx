import { Text } from 'react-native-paper';

export default function CardDesription({ description }: { description: string }) {
  return (
    <Text variant="bodyLarge" style={{ marginLeft: 15, marginBottom: 10 }}>
      {description}
    </Text>
  );
}
