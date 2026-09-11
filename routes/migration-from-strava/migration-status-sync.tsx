import { useEffect, useRef } from 'react';
import { Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import { useGetStravaMigrationStatusQuery } from '@R/services/activity/activity';
import { setMigrationError, setMigrationJob } from '@R/slices/migration/migration';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';

export default function MigrationStatusSync() {
  const dispatch = useAppDispatch();
  const { jobId, job } = useAppSelector(({ migration }) => migration);
  const lastStatusError = useRef<string | null>(null);
  const lastCompletedJob = useRef<string | null>(null);
  const isTerminal = job?.status === 'completed' || job?.status === 'failed';
  const { data, error } = useGetStravaMigrationStatusQuery(jobId ?? '', {
    skip: !jobId,
    pollingInterval: jobId && !isTerminal ? 2000 : 0,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!data) return;

    dispatch(setMigrationJob(data));
    lastStatusError.current = null;

    if (data.status === 'completed' && lastCompletedJob.current !== data.jobId) {
      lastCompletedJob.current = data.jobId;
      dispatch(runichApi.util.invalidateTags([Tags.activities]));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (!error || !jobId) return;

    const message = `Не удалось получить статус миграции: ${getErrorMessageFromError(error)}`;
    if (lastStatusError.current === message) return;
    lastStatusError.current = message;
    dispatch(setMigrationError(message));
  }, [dispatch, error, jobId]);

  return null;
}
