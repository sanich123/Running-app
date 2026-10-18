import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';

export default function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  switchLabel: { flex: 1 },
});
