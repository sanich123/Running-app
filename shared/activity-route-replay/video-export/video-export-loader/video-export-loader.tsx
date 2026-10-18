import { Modal, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Text, useTheme } from 'react-native-paper';
import type { VideoExportLoaderProps } from '../types';

export default function VideoExportLoader({ visible, title, message, cancelLabel, onCancel }: VideoExportLoaderProps) {
  const { colors } = useTheme();

  return (
    // Android recording uses PixelCopy on the activity window; a native Modal keeps this UI out of captured frames.
    <Modal
      animationType="fade"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      onRequestClose={() => undefined}>
      <View style={styles.backdrop}>
        <View style={[styles.loader, { backgroundColor: colors.surface }]}>
          <View style={styles.spinnerControl}>
            <ActivityIndicator animating color={colors.primary} size={64} />
            <IconButton
              icon="close"
              mode="contained-tonal"
              iconColor={colors.onSurface}
              containerColor={colors.surfaceVariant}
              accessibilityLabel={cancelLabel}
              onPress={onCancel}
              style={styles.cancelButton}
              testID="activity-route-replay-cancel-export"
            />
          </View>
          <Text variant="titleMedium" style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={[styles.message, { color: colors.onSurfaceVariant }]}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loader: {
    alignItems: 'center',
    borderRadius: 24,
    elevation: 8,
    maxWidth: 320,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: '100%',
  },
  spinnerControl: { alignItems: 'center', height: 72, justifyContent: 'center', marginBottom: 14, width: 72 },
  cancelButton: { margin: 0, position: 'absolute' },
  title: { marginBottom: 8, textAlign: 'center' },
  message: { textAlign: 'center' },
});
