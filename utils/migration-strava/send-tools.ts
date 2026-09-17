import { errorToast } from '@S/error-toast/error-toast';
import { MigrationArchiveCancelledError, getMigrationErrorMessage, toFileUri } from './utils';
import type { MigrationCancelHandler } from './types';
import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

const MIGRATION_ARCHIVE_REQUEST_TIMEOUT = 5 * 60 * 1000;

export { MigrationArchiveCancelledError } from './utils';

export class MigrationArchiveTransferError extends Error {
  constructor(message: string) {
    super(`Ошибка передачи архива: ${message}`);
    this.name = 'MigrationArchiveTransferError';
  }
}

export const isMigrationArchiveCancelledError = (error: unknown): error is MigrationArchiveCancelledError =>
  error instanceof MigrationArchiveCancelledError;
export const isMigrationArchiveTransferError = (error: unknown): error is MigrationArchiveTransferError =>
  error instanceof MigrationArchiveTransferError;

function sendArchiveRequest(
  formData: FormData,
  userId: string,
  accessToken: string,
  setIsWaitingForServer: (arg: boolean) => void,
  setUploadProgress: (arg: number) => void,
  onCancelReady: (cancel: MigrationCancelHandler) => void,
): Promise<ActivityMigrationJobResponse> {
  return new Promise<ActivityMigrationJobResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    let settled = false;
    request.open('POST', `${process.env.EXPO_PUBLIC_BASE_URL}/activity/migration-strava/${userId}`);
    request.timeout = MIGRATION_ARCHIVE_REQUEST_TIMEOUT;
    request.setRequestHeader('authorization', `Bearer ${accessToken}`);
    let isWaiting = false;
    const startWaitingForServer = () => {
      if (!isWaiting) {
        isWaiting = true;
        setIsWaitingForServer(true);
      }
      setUploadProgress(1);
    };
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      onCancelReady(null);
      callback();
    };
    const cancelRequest = () => {
      if (!settled) request.abort();
    };
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        setUploadProgress(Math.min(1, event.loaded / event.total));
        if (event.loaded >= event.total) startWaitingForServer();
      }
    };
    request.upload.onload = startWaitingForServer;
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        try {
          const response = JSON.parse(request.responseText) as ActivityMigrationJobResponse;
          if (!response.jobId) throw new Error('Сервер не вернул идентификатор задачи миграции');
          finish(() => resolve(response));
        } catch (error) {
          finish(() => reject(error instanceof Error ? error : new Error('Некорректный ответ сервера')));
        }
      } else {
        finish(() => reject(new Error(`Сервер вернул статус ${request.status}`)));
      }
    };
    request.onerror = () => finish(() => reject(new Error('Не удалось отправить архив на сервер')));
    request.ontimeout = () => finish(() => reject(new Error('Истекло время ожидания ответа сервера (5 минут)')));
    request.onabort = () => finish(() => reject(new MigrationArchiveCancelledError()));
    onCancelReady(cancelRequest);
    request.send(formData);
  });
}

interface SendArchiveOptions {
  setIsSendingArchive: (arg: boolean) => void;
  setIsWaitingForServer: (arg: boolean) => void;
  setUploadProgress: (arg: number) => void;
  onCancelReady: (cancel: MigrationCancelHandler) => void;
  setIsError: (arg: string) => void;
  userId: string;
  accessToken: string;
}

async function sendArchiveFormData(
  createFormData: () => FormData,
  {
    setIsSendingArchive,
    setIsWaitingForServer,
    setUploadProgress,
    onCancelReady,
    setIsError,
    userId,
    accessToken,
  }: SendArchiveOptions,
): Promise<ActivityMigrationJobResponse> {
  try {
    setIsSendingArchive(true);
    setIsWaitingForServer(false);
    const formData = createFormData();
    return await sendArchiveRequest(
      formData,
      userId,
      accessToken,
      setIsWaitingForServer,
      setUploadProgress,
      onCancelReady,
    );
  } catch (error) {
    if (isMigrationArchiveCancelledError(error)) throw error;
    const transferError = isMigrationArchiveTransferError(error)
      ? error
      : new MigrationArchiveTransferError(getMigrationErrorMessage(error));
    setIsError(transferError.message);
    errorToast('Ошибка передачи архива', transferError);
    throw transferError;
  } finally {
    setIsSendingArchive(false);
    setIsWaitingForServer(false);
    onCancelReady(null);
  }
}

export async function sendArchiveToServer({
  pathToArchive,
  ...options
}: SendArchiveOptions & { pathToArchive: string }) {
  return await sendArchiveFormData(() => {
    const formData = new FormData();
    formData.append('archive', {
      uri: toFileUri(pathToArchive),
      name: 'archiveToSend.zip',
      type: 'application/zip',
    } as unknown as Blob);
    return formData;
  }, options);
}

export async function sendArchiveToServerWeb({
  archiveFile,
  ...options
}: SendArchiveOptions & {
  archiveFile: Blob & { name?: string };
}) {
  return await sendArchiveFormData(() => {
    const formData = new FormData();
    formData.append('archive', archiveFile, archiveFile.name || 'archiveToSend.zip');
    return formData;
  }, options);
}
