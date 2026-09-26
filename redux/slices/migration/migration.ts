import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MIGRATION_INITIAL_STATE } from './const';
import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

const migration = createSlice({
  name: 'migration',
  initialState: MIGRATION_INITIAL_STATE,
  reducers: {
    setIsDisabled: (state, action: PayloadAction<boolean>) => {
      state.isDisabled = action.payload;
    },
    setIsUnzipping: (state, action: PayloadAction<boolean>) => {
      state.isUnzipping = action.payload;
    },
    setIsRemovingMedia: (state, action: PayloadAction<boolean>) => {
      state.isRemovingMedia = action.payload;
    },
    setIsZipping: (state, action: PayloadAction<boolean>) => {
      state.isZipping = action.payload;
    },
    setIsSendingArchive: (state, action: PayloadAction<boolean>) => {
      state.isSendingArchive = action.payload;
    },
    setIsWaitingForServer: (state, action: PayloadAction<boolean>) => {
      state.isWaitingForServer = action.payload;
    },
    setIsDeletingCacheFolder: (state, action: PayloadAction<boolean>) => {
      state.isDeletingCacheFolder = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = Math.min(1, Math.max(0, action.payload));
    },
    setMigrationError: (state, action: PayloadAction<string>) => {
      if (!action.payload) {
        state.error = null;
        state.dismissedError = null;
        return;
      }
      state.error = action.payload;
      state.dismissedError = null;
    },
    clearMigrationError: (state) => {
      state.dismissedError = state.error;
      state.error = null;
    },
    clearMigrationErrorOnServerConfirmation: (state) => {
      state.error = null;
      state.dismissedError = null;
    },
    acceptMigrationJob: (state, action: PayloadAction<ActivityMigrationJobResponse>) => {
      state.jobId = action.payload.jobId;
      state.job = action.payload;
      state.isDisabled = false;
      state.isUnzipping = false;
      state.isRemovingMedia = false;
      state.isZipping = false;
      state.isSendingArchive = false;
      state.isWaitingForServer = false;
      state.isDeletingCacheFolder = false;
      state.uploadProgress = 0;
      state.error = null;
      state.dismissedError = null;
    },
    setMigrationJob: (state, action: PayloadAction<ActivityMigrationJobResponse>) => {
      state.jobId = action.payload.jobId;
      state.job = action.payload;
      if (action.payload.status === 'failed') {
        const errorMessage = action.payload.errorMessage || 'Архив не удалось обработать';
        if (errorMessage !== state.dismissedError) state.error = errorMessage;
      }
    },
    resetMigration: () => MIGRATION_INITIAL_STATE,
  },
});

export const {
  setIsDisabled,
  setIsUnzipping,
  setIsRemovingMedia,
  setIsZipping,
  setIsSendingArchive,
  setIsWaitingForServer,
  setIsDeletingCacheFolder,
  setUploadProgress,
  setMigrationError,
  clearMigrationError,
  clearMigrationErrorOnServerConfirmation,
  acceptMigrationJob,
  setMigrationJob,
  resetMigration,
} = migration.actions;

export default migration.reducer;
