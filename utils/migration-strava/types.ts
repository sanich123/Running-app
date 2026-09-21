import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

export type MigrationCancelHandler = (() => void) | null;

export interface StartStravaMigrationProps {
  setIsDisabled: (arg: boolean) => void;
  setIsUnzipping: (arg: boolean) => void;
  setIsZipping: (arg: boolean) => void;
  setIsRemovingMedia: (arg: boolean) => void;
  setIsSendingArchive: (arg: boolean) => void;
  setIsWaitingForServer: (arg: boolean) => void;
  setIsDeletingCacheFolder: (arg: boolean) => void;
  setUploadProgress: (arg: number) => void;
  setIsError: (arg: string) => void;
  onCancelReady: (cancel: MigrationCancelHandler) => void;
  onArchiveUploadAccepted: (job: ActivityMigrationJobResponse) => void;
  userId: string;
  accessToken: string;
}
