import { View, StyleSheet } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import type { SwitchRowProps } from './types';

export default function SwitchRow({ label, value, onValueChange }: SwitchRowProps) {
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
