import type { ActivityMigrationJobResponse } from '@R/runich-api/activity-types';

export interface MigrationState {
  isDisabled: boolean;
  isUnzipping: boolean;
  isRemovingMedia: boolean;
  isZipping: boolean;
  isSendingArchive: boolean;
  isWaitingForServer: boolean;
  isDeletingCacheFolder: boolean;
  uploadProgress: number;
  jobId: string | null;
  job: ActivityMigrationJobResponse | null;
  error: string | null;
  dismissedError: string | null;
}
