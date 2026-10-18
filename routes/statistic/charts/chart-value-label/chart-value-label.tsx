import { Text } from 'react-native-paper';

export default function ChartValueLabel(text: string) {
  return (
    <Text variant="bodyMedium" style={{ width: 50, color: 'white', fontWeight: 'bold' }}>
      {text}
    </Text>
  );
}
