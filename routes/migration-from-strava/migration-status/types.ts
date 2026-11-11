import type { MigrationCopy } from '../const';
import type { MigrationViewState } from '../hooks';

export interface MigrationStatusProps {
  state: MigrationViewState;
  copy: MigrationCopy;
  isProcessing: boolean;
  isCancelAvailable: boolean;
  isForegroundUploadSession: boolean;
  onChooseArchive: () => void;
  onCancel: () => void;
  onDismissError: () => void;
}
