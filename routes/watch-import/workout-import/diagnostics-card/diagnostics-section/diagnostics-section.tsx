import type { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import type { DiagnosticsSectionProps } from '../../../types';

export default function DiagnosticsSection({ children, icon, title }: PropsWithChildren<DiagnosticsSectionProps>) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Icon source={icon} size={18} color={colors.primary} />
        <Text variant="titleSmall">{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
