import type { MigrationCopy } from '../const';
import type { MigrationViewState } from '../hooks';

export function getStatusText(state: MigrationViewState, copy: MigrationCopy) {
  if (state.isUnzipping) return copy.unzipping;
  if (state.isRemovingMedia) return copy.remove;
  if (state.isZipping) return copy.zipping;
  if (state.isSendingArchive) return state.isWaitingForServer ? copy.waitingForServer : copy.transfer;
  if (state.isDeletingCacheFolder) return copy.cleaning;
  if (state.error && !state.job) return copy.error;
  if (state.isServerCompleted) return copy.successSending;
  if (state.isServerFailed) return state.job?.errorMessage || copy.failed;
  if (state.isServerCancelled) return copy.cancelled;
  if (state.job?.status === 'uploading') {
    const archiveFullyReceived =
      state.job.uploadBytesTotal > 0 && state.job.uploadBytesReceived >= state.job.uploadBytesTotal;
    return archiveFullyReceived ? copy.waitingForServer : copy.uploading;
  }
  if (state.job?.status === 'queued') return copy.queued;
  if (state.job?.status === 'processing') return copy.processing;
  return '';
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
