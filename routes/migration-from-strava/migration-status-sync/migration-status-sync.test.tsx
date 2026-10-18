import { render } from '@testing-library/react-native';
import { Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import {
  clearMigrationErrorOnServerConfirmation,
  setIsWaitingForServer,
  setMigrationJob,
} from '@R/slices/migration/migration';
import type * as MigrationStatusSyncModule from './migration-status-sync';
import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

const mockDispatch = jest.fn();
const mockMigrationState = { jobId: null, job: null };
const mockCompletedJob: ActivityMigrationJobResponse = {
  jobId: 'completed-job',
  status: 'completed',
  uploadBytesReceived: 100,
  uploadBytesTotal: 100,
  queuePosition: null,
  queueAhead: 0,
  queueSize: 0,
  totalActivities: 2,
  processedActivities: 2,
  importedActivities: 2,
  skippedActivities: 0,
  errorMessage: null,
  createdAt: '2026-10-18T10:00:00.000Z',
  startedAt: '2026-10-18T10:00:00.000Z',
  finishedAt: '2026-10-18T10:01:00.000Z',
};
const mockCurrentStatusQuery = jest.fn(() => ({ data: mockCompletedJob, error: undefined }));
const mockJobStatusQuery = jest.fn(() => ({ data: undefined, error: undefined }));

jest.mock('expo-router', () => ({ useIsFocused: () => true }));
jest.mock('@R/typed-hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: { migration: typeof mockMigrationState }) => unknown) =>
    selector({ migration: mockMigrationState }),
}));
jest.mock('@R/services/activity/activity', () => ({
  useGetCurrentStravaMigrationStatusQuery: () => mockCurrentStatusQuery(),
  useGetStravaMigrationStatusQuery: () => mockJobStatusQuery(),
}));

const MigrationStatusSync = require('./migration-status-sync').default as typeof MigrationStatusSyncModule.default;

describe('MigrationStatusSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves a completed server job and refreshes activity statistics', async () => {
    await render(<MigrationStatusSync />);

    expect(mockDispatch).toHaveBeenCalledWith(setMigrationJob(mockCompletedJob));
    expect(mockDispatch).toHaveBeenCalledWith(clearMigrationErrorOnServerConfirmation());
    expect(mockDispatch).toHaveBeenCalledWith(setIsWaitingForServer(false));
    expect(mockDispatch).toHaveBeenCalledWith(runichApi.util.invalidateTags([Tags.activities, Tags.statistics]));
  });
});
