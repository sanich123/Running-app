import { Text } from 'react-native-paper';

export default function CardTitle({ title }: { title: string }) {
  return (
    <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
      {title}
    </Text>
  );
}
