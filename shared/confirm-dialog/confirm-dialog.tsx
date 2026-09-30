import { ActivityIndicator, Dialog, Button, Portal, Text, useTheme } from 'react-native-paper';
import type { ConfirmDialogProps } from './types';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  loading = false,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => {
          if (!loading) onDismiss();
        }}
        dismissable={!loading}
        dismissableBackButton={!loading}
        style={{ backgroundColor: colors.surface }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
          {loading && <ActivityIndicator testID="confirm-dialog-loading" size="small" style={{ marginTop: 16 }} />}
        </Dialog.Content>
        <Dialog.Actions>
          {cancelText ? (
            <Button
              testID="confirm-dialog-cancel-button"
              mode="text"
              textColor={colors.onSurfaceVariant}
              onPress={onDismiss}
              disabled={loading}>
              {cancelText}
            </Button>
          ) : null}
          <Button
            testID="confirm-dialog-confirm-button"
            mode="text"
            textColor={colors.primary}
            onPress={onConfirm}
            disabled={loading}
            loading={loading}>
            {!loading && confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
