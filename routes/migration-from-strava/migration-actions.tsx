import { Button } from 'react-native-paper';
import type { MigrationCopy } from './const';

export default function MigrationActions({
  isProcessing,
  isCancelAvailable,
  isInitial,
  isServerCompleted,
  isServerFailed,
  hasError,
  copy,
  onChooseArchive,
  onCancel,
}: {
  isProcessing: boolean;
  isCancelAvailable: boolean;
  isInitial: boolean;
  isServerCompleted: boolean;
  isServerFailed: boolean;
  hasError: boolean;
  copy: MigrationCopy;
  onChooseArchive: () => void;
  onCancel: () => void;
}) {
  if (isProcessing && isCancelAvailable) {
    return (
      <Button
        mode="outlined"
        icon="close-circle-outline"
        onPress={onCancel}
        testID="migration-cancel"
        style={styles.action}
        contentStyle={styles.actionContent}>
        {copy.cancel}
      </Button>
    );
  }

  if (isProcessing) return null;

  return (
    <Button
      mode="contained"
      icon={
        isInitial || isServerCompleted || isServerFailed
          ? 'file-upload-outline'
          : hasError
            ? 'refresh'
            : 'progress-clock'
      }
      onPress={onChooseArchive}
      style={styles.action}
      contentStyle={styles.actionContent}>
      {getActionText({ isInitial, isServerCompleted, isServerFailed, hasError, copy })}
    </Button>
  );
}

function getActionText({
  isInitial,
  isServerCompleted,
  isServerFailed,
  hasError,
  copy,
}: Pick<
  Parameters<typeof MigrationActions>[0],
  'isInitial' | 'isServerCompleted' | 'isServerFailed' | 'hasError' | 'copy'
>) {
  if (isServerCompleted || isServerFailed || isInitial) return copy.chooseArchive;
  if (hasError) return copy.error;
  return copy.processing;
}

const styles = {
  action: {
    borderRadius: 14,
  },
  actionContent: {
    minHeight: 52,
  },
};
