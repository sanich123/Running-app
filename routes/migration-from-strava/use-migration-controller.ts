import { useCallback, useRef, useState } from 'react';
import {
  acceptMigrationJob,
  resetMigration,
  setIsDeletingCacheFolder,
  setIsDisabled,
  setIsRemovingMedia,
  setIsSendingArchive,
  setIsUnzipping,
  setIsWaitingForServer,
  setIsZipping,
  setMigrationError,
  setUploadProgress,
} from '@R/slices/migration/migration';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { startStravaMigration } from '@U/migration-strava/migration-archive';
import { cancelActiveMigrationUpload } from '@U/migration-strava/send-tools';
import useMigrationState from './hooks';
import type { MigrationCancelHandler } from '@U/migration-strava/types';

export default function useMigrationController() {
  const dispatch = useAppDispatch();
  const { userId, accessToken } = useAppSelector(({ auth }) => auth);
  const state = useMigrationState();
  const cancelMigrationRef = useRef<MigrationCancelHandler>(null);
  const [isCancelAvailable, setIsCancelAvailable] = useState(false);

  const handleCancelReady = useCallback((cancel: MigrationCancelHandler) => {
    cancelMigrationRef.current = cancel;
    setIsCancelAvailable(Boolean(cancel));
  }, []);

  const handleCancel = useCallback(() => {
    if (cancelMigrationRef.current) {
      cancelMigrationRef.current();
      dispatch(resetMigration());
      return;
    }
    if (state.jobId) {
      void cancelActiveMigrationUpload(state.jobId, accessToken);
      dispatch(resetMigration());
    }
  }, [accessToken, dispatch, state.jobId]);

  const handleChooseArchive = useCallback(async () => {
    dispatch(resetMigration());
    try {
      await startStravaMigration({
        setIsDisabled: (value) => dispatch(setIsDisabled(value)),
        setIsUnzipping: (value) => dispatch(setIsUnzipping(value)),
        setIsRemovingMedia: (value) => dispatch(setIsRemovingMedia(value)),
        setIsZipping: (value) => dispatch(setIsZipping(value)),
        setIsSendingArchive: (value) => dispatch(setIsSendingArchive(value)),
        setIsWaitingForServer: (value) => dispatch(setIsWaitingForServer(value)),
        setIsDeletingCacheFolder: (value) => dispatch(setIsDeletingCacheFolder(value)),
        setUploadProgress: (value) => dispatch(setUploadProgress(value)),
        setIsError: (value) => dispatch(setMigrationError(value)),
        onCancelReady: handleCancelReady,
        onArchiveUploadAccepted: (job) => dispatch(acceptMigrationJob(job)),
        userId,
        accessToken,
      });
    } catch (error) {
      errorToast('Ошибка миграции из Strava', error);
    }
  }, [accessToken, dispatch, handleCancelReady, userId]);

  return {
    handleCancel,
    handleChooseArchive,
    isCancelAvailable,
    state,
  };
}
