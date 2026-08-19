import { View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import type { EmptyStateProps } from './types';

export default function EmptyState({ icon, title, message, style, testID }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID} style={[styles.container, { backgroundColor: colors.surfaceVariant }, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={30} color={colors.primary} />
      </View>
      <Text variant="titleMedium" style={[styles.title, { color: colors.onSurface }]}>
        {title}
      </Text>
      {message && (
        <Text variant="bodyMedium" style={[styles.message, { color: colors.onSurfaceVariant }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    margin: 16,
    minHeight: 180,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 14,
    width: 56,
  },
  title: { fontWeight: '800', textAlign: 'center' },
  message: { marginTop: 8, textAlign: 'center' },
});
