import type { MigrationState } from './types';

export const MIGRATION_INITIAL_STATE: MigrationState = {
  isDisabled: false,
  isUnzipping: false,
  isRemovingMedia: false,
  isZipping: false,
  isSendingArchive: false,
  isWaitingForServer: false,
  isDeletingCacheFolder: false,
  uploadProgress: 0,
  jobId: null,
  job: null,
  error: null,
  dismissedError: null,
};
