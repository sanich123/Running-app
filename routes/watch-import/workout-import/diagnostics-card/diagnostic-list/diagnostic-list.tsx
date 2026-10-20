import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../../../health-connect-link/utils';
import type { DiagnosticListProps } from '../../../types';

export default function DiagnosticList({ items }: DiagnosticListProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const valueColor =
          item.tone === 'error'
            ? colors.error
            : item.tone === 'success'
              ? colors.primary
              : item.tone === 'muted'
                ? colors.onSurfaceVariant
                : colors.onSurface;

        return (
          <View key={`${item.label}-${index}`} style={styles.row}>
            <Text variant="labelMedium" style={[styles.label, { color: colors.onSurfaceVariant }]}>
              {renderHealthConnectLinks(item.label, colors.primary)}
            </Text>
            <Text variant="bodySmall" style={[styles.value, { color: valueColor }]}>
              {renderHealthConnectLinks(item.value, colors.primary)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 10, overflow: 'hidden' },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, minHeight: 38, paddingVertical: 8 },
  label: { flex: 0.9 },
  value: { flex: 1.4, lineHeight: 18, textAlign: 'right' },
});
