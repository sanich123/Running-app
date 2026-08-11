export interface GetMigrationArchiveAndSendToServerProps {
  setIsDisabled: (arg: boolean) => void;
  setIsUnzipping: (arg: boolean) => void;
  setIsZipping: (arg: boolean) => void;
  setIsRemovingMedia: (arg: boolean) => void;
  setIsSendingArchive: (arg: boolean) => void;
  setIsWaitingForServer: (arg: boolean) => void;
  setIsDeletingCacheFolder: (arg: boolean) => void;
  setIsSuccess: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  onArchiveUploadSuccess: () => void;
  userId: string;
  accessToken: string;
}
