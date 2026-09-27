import { useAppSelector } from '@R/typed-hooks';
import type { MigrationState } from '@R/slices/migration/types';

export type MigrationViewState = MigrationState & {
  isInitial: boolean;
  isProcessing: boolean;
  isServerCompleted: boolean;
  isServerFailed: boolean;
  isServerCancelled: boolean;
  isArchiveTransferActive: boolean;
  progress: number;
  progressPercent: number;
  uploadProgressPercent: number;
};

export default function useMigrationState(): MigrationViewState {
  const migration = useAppSelector(({ migration: state }) => state);
  const isServerProcessing = Boolean(
    migration.jobId && !['completed', 'failed', 'cancelled'].includes(migration.job?.status ?? ''),
  );
  const isServerCompleted = migration.job?.status === 'completed';
  const isServerFailed = migration.job?.status === 'failed';
  const isServerCancelled = migration.job?.status === 'cancelled';
  const isProcessing = (migration.isDisabled && !migration.error) || isServerProcessing;
  const progress = migration.job?.totalActivities
    ? Math.min(1, migration.job.processedActivities / migration.job.totalActivities)
    : 0;

  return {
    ...migration,
    isInitial:
      !migration.isDisabled &&
      !migration.isUnzipping &&
      !migration.isRemovingMedia &&
      !migration.isZipping &&
      !migration.isSendingArchive &&
      !migration.isWaitingForServer &&
      !migration.isDeletingCacheFolder &&
      !migration.error &&
      !migration.jobId,
    isProcessing,
    isServerCompleted,
    isServerFailed,
    isServerCancelled,
    isArchiveTransferActive:
      migration.isSendingArchive || migration.isWaitingForServer || migration.job?.status === 'uploading',
    progress,
    progressPercent: Math.round(progress * 100),
    uploadProgressPercent: Math.round(migration.uploadProgress * 100),
  };
}
