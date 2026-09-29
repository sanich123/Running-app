import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import type { EmptyStateProps } from '../types';

export default function EmptyState({ message }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Icon source="map-marker-path" size={40} color={colors.onSurfaceVariant} />
      <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
});
