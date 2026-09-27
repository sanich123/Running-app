import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { AUTH_DIVIDER_TEXT } from '../const';

export default function AuthDivider() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  return (
    <View style={styles.layout}>
      <View style={[styles.line, { backgroundColor: colors.outline }]} />
      <Text style={styles.label}>{AUTH_DIVIDER_TEXT[language]}</Text>
      <View style={[styles.line, { backgroundColor: colors.outline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 4, marginTop: 0 },
  line: { flex: 1, height: 1, transform: [{ translateY: 3 }] },
  label: { fontWeight: '600' },
});
