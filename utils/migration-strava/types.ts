import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

export interface GetMigrationArchiveAndSendToServerProps {
  setIsDisabled: (arg: boolean) => void;
  setIsUnzipping: (arg: boolean) => void;
  setIsZipping: (arg: boolean) => void;
  setIsRemovingMedia: (arg: boolean) => void;
  setIsSendingArchive: (arg: boolean) => void;
  setIsWaitingForServer: (arg: boolean) => void;
  setIsDeletingCacheFolder: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  onArchiveUploadAccepted: (job: ActivityMigrationJobResponse) => void;
  userId: string;
  accessToken: string;
}
