import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { renderHealthConnectLinks } from '../../../health-connect-link';
import { getBooleanLabel } from '../../helpers';
import type { DiagnosticMetricProps } from '../../../types';

export default function DiagnosticMetric({ isRussian, label, status, value }: DiagnosticMetricProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.metric}>
      <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
        {renderHealthConnectLinks(label, colors.primary)}
      </Text>
      {status === undefined ? (
        <Text variant="bodySmall" style={styles.value}>
          {typeof value === 'string' ? renderHealthConnectLinks(value, colors.primary) : value}
        </Text>
      ) : (
        <View
          testID="diagnostic-metric-status"
          style={[styles.status, { backgroundColor: status ? colors.primaryContainer : colors.errorContainer }]}>
          <Text variant="labelMedium" style={{ color: status ? colors.onPrimaryContainer : colors.onErrorContainer }}>
            {getBooleanLabel(status, isRussian)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { gap: 4, justifyContent: 'space-between', minHeight: 48, width: '47%' },
  value: { fontWeight: '600' },
  status: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
});
