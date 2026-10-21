import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Icon, Portal, Text, useTheme } from 'react-native-paper';
import type { ConfirmDialogProps } from './types';

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  destructive = false,
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
        style={[destructive && styles.destructiveDialog, { backgroundColor: colors.surface }]}>
        {destructive ? (
          <View style={[styles.destructiveIcon, { backgroundColor: colors.errorContainer }]}>
            <Icon source="delete-alert-outline" size={28} color={colors.error} />
          </View>
        ) : null}
        <Dialog.Title style={destructive ? styles.destructiveTitle : undefined}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text
            variant="bodyMedium"
            style={destructive ? [styles.destructiveMessage, { color: colors.onSurfaceVariant }] : undefined}>
            {message}
          </Text>
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
            mode={destructive ? 'contained' : 'text'}
            buttonColor={destructive ? colors.error : undefined}
            textColor={destructive ? colors.onError : colors.primary}
            style={destructive ? styles.destructiveButton : undefined}
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

const styles = StyleSheet.create({
  destructiveDialog: { borderRadius: 24 },
  destructiveIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginTop: 24,
    width: 56,
  },
  destructiveTitle: { textAlign: 'center' },
  destructiveMessage: { textAlign: 'center' },
  destructiveButton: { borderRadius: 12 },
});
