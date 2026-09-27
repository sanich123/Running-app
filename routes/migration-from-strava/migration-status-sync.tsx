import { useEffect, useRef } from 'react';
import { Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import {
  useGetCurrentStravaMigrationStatusQuery,
  useGetStravaMigrationStatusQuery,
} from '@R/services/activity/activity';
import {
  clearMigrationErrorOnServerConfirmation,
  setIsWaitingForServer,
  setMigrationError,
  setMigrationJob,
} from '@R/slices/migration/migration';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';

export default function MigrationStatusSync() {
  const dispatch = useAppDispatch();
  const { jobId, job } = useAppSelector(({ migration }) => migration);
  const lastStatusError = useRef<string | null>(null);
  const lastCompletedJob = useRef<string | null>(null);
  const isTerminal = ['completed', 'failed', 'cancelled'].includes(job?.status ?? '');
  const { data: currentJob, error: currentJobError } = useGetCurrentStravaMigrationStatusQuery(undefined, {
    skip: Boolean(jobId),
    refetchOnMountOrArgChange: true,
  });
  const { data: jobStatus, error: jobStatusError } = useGetStravaMigrationStatusQuery(jobId ?? '', {
    skip: !jobId,
    pollingInterval: jobId && !isTerminal ? 2000 : 0,
    refetchOnMountOrArgChange: true,
  });
  const data = jobId ? jobStatus : currentJob;
  const error = jobId ? jobStatusError : currentJobError;

  useEffect(() => {
    if (!data) return;

    dispatch(setMigrationJob(data));
    lastStatusError.current = null;

    const archiveFullyReceived = data.uploadBytesTotal > 0 && data.uploadBytesReceived >= data.uploadBytesTotal;
    if (data.status !== 'failed' && (data.status !== 'uploading' || archiveFullyReceived)) {
      dispatch(clearMigrationErrorOnServerConfirmation());
    }
    if (data.status !== 'uploading') dispatch(setIsWaitingForServer(false));

    if (data.status === 'completed' && lastCompletedJob.current !== data.jobId) {
      lastCompletedJob.current = data.jobId;
      dispatch(runichApi.util.invalidateTags([Tags.activities, Tags.statistics]));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (!error || !jobId) return;

    const message = `Не удалось получить статус миграции: ${getErrorMessageFromError(error)}`;
    if (lastStatusError.current === message) return;
    lastStatusError.current = message;
    dispatch(setMigrationError(message));
    errorToast(message, error);
  }, [dispatch, error, jobId]);

  return null;
}
