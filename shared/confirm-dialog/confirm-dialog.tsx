import { Dialog, Button, Portal, Text, useTheme } from 'react-native-paper';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void | Promise<void>;
  onDismiss: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  onConfirm,
  onDismiss,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: colors.surface }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button mode="text" textColor={colors.primary} onPress={onConfirm}>
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
