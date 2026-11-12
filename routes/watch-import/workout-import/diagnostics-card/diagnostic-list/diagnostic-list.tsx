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
          <View key={`${item.label}-${index}`} style={styles.item}>
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
  list: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 6 },
  item: { gap: 0, minWidth: '46%', flexGrow: 1, flexBasis: '46%' },
  label: { fontSize: 11, lineHeight: 13 },
  value: { fontSize: 12, lineHeight: 15 },
});
