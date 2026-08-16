import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function AuthDivider() {
  const { colors } = useTheme();
  return (
    <View style={styles.layout}>
      <View style={[styles.line, { backgroundColor: colors.outline }]} />
      <Text style={styles.label}>или</Text>
      <View style={[styles.line, { backgroundColor: colors.outline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 4, marginTop: 0 },
  line: { flex: 1, height: 1 },
  label: { fontWeight: '600' },
});
