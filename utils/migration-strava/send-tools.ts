import { File as ExpoFile } from 'expo-file-system';
import { fetch as nitroFetch } from 'react-native-nitro-fetch';
import { errorToast } from '@S/error-toast/error-toast';
import {
  nativeArchiveUploadTransport,
  webArchiveUploadTransport,
  type ArchiveUploadTransport,
} from './upload-transport';
import { MigrationArchiveCancelledError, getMigrationErrorMessage, toFileUri } from './utils';
import type { MigrationCancelHandler } from './types';
import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

export { MigrationArchiveCancelledError } from './utils';

const activeUploadCancellers = new Map<string, () => void>();

class MigrationArchiveTransferError extends Error {
  constructor(message: string) {
    super(`Ошибка передачи архива: ${message}`);
    this.name = 'MigrationArchiveTransferError';
  }
}

export const isMigrationArchiveCancelledError = (error: unknown): error is MigrationArchiveCancelledError =>
  error instanceof MigrationArchiveCancelledError;
export const isMigrationArchiveTransferError = (error: unknown): error is MigrationArchiveTransferError =>
  error instanceof MigrationArchiveTransferError;

interface SendArchiveOptions {
  setIsSendingArchive: (arg: boolean) => void;
  setIsWaitingForServer: (arg: boolean) => void;
  setUploadProgress: (arg: number) => void;
  onCancelReady: (cancel: MigrationCancelHandler) => void;
  onArchiveUploadAccepted: (job: ActivityMigrationJobResponse) => void;
  setIsError: (arg: string) => void;
  userId: string;
  accessToken: string;
}

interface UploadInput {
  totalBytes: number;
  transport: ArchiveUploadTransport;
  fileUri?: string;
  file?: Blob;
}

export async function cancelActiveMigrationUpload(jobId: string, accessToken: string) {
  activeUploadCancellers.get(jobId)?.();

  try {
    await nitroFetch(`${getBaseUrl()}/activity/migration-strava/jobs/${jobId}/cancel`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // The native request cancellation is already local. The server will mark
    // an abandoned upload as failed after its inactivity timeout.
  }
}

async function sendArchive({ totalBytes, transport, fileUri, file, ...options }: SendArchiveOptions & UploadInput) {
  let jobId: string | null = null;
  let uploadJob: ActivityMigrationJobResponse | null = null;
  let uploadProgress = 0;

  try {
    options.setIsSendingArchive(true);
    options.setIsWaitingForServer(false);
    options.setUploadProgress(0);

    const createdJob = await startArchiveUpload(totalBytes, options.userId, options.accessToken);
    uploadJob = createdJob;
    jobId = createdJob.jobId;
    options.onArchiveUploadAccepted(createdJob);

    let transportCancel: MigrationCancelHandler = null;
    let cancelRequested = false;
    const cancelTransport = () => {
      cancelRequested = true;
      transportCancel?.();
    };
    activeUploadCancellers.set(createdJob.jobId, cancelTransport);
    options.onCancelReady(() => {
      void cancelActiveMigrationUpload(createdJob.jobId, options.accessToken);
    });

    if (cancelRequested) throw new MigrationArchiveCancelledError();

    const response = await transport.upload({
      url: `${getBaseUrl()}/activity/migration-strava/jobs/${createdJob.jobId}/archive`,
      accessToken: options.accessToken,
      fileUri,
      file,
      onCancelReady: (nextCancel) => {
        transportCancel = nextCancel;
        if (cancelRequested) nextCancel();
      },
      onProgress: (written, total) => {
        uploadProgress = total > 0 ? Math.min(1, written / total) : 0;
        options.setUploadProgress(uploadProgress);
        if (uploadProgress >= 1) options.setIsWaitingForServer(true);
      },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new MigrationArchiveTransferError(getUploadResponseError(response.status, response.body));
    }

    const completedUploadJob = parseJobResponse(response.body);
    options.onArchiveUploadAccepted(completedUploadJob);
    return completedUploadJob;
  } catch (error) {
    if (isMigrationArchiveCancelledError(error)) throw error;

    // The native uploader can time out while waiting for the API's response,
    // even after it sent the entire body. Keep the already-created job and let
    // the server-status poll confirm whether it was accepted or failed.
    if (jobId && uploadJob && uploadProgress >= 1 && !isMigrationArchiveTransferError(error)) {
      return uploadJob;
    }

    const transferError = isMigrationArchiveTransferError(error)
      ? error
      : new MigrationArchiveTransferError(getMigrationErrorMessage(error));
    options.setIsError(transferError.message);
    errorToast('Ошибка передачи архива', transferError);
    throw transferError;
  } finally {
    if (jobId) activeUploadCancellers.delete(jobId);
    options.setIsSendingArchive(false);
    options.setIsWaitingForServer(false);
    options.onCancelReady(null);
  }
}

export async function sendArchiveToServer({
  pathToArchive,
  ...options
}: SendArchiveOptions & { pathToArchive: string }) {
  const file = new ExpoFile(toFileUri(pathToArchive));
  if (!file.exists || !file.size) throw new Error('Нет файла для отправки');

  return await sendArchive({
    ...options,
    fileUri: toFileUri(pathToArchive),
    totalBytes: file.size,
    transport: nativeArchiveUploadTransport,
  });
}

export async function sendArchiveToServerWeb({
  archiveFile,
  ...options
}: SendArchiveOptions & { archiveFile: Blob & { name?: string } }) {
  return await sendArchive({
    ...options,
    file: archiveFile,
    totalBytes: archiveFile.size,
    transport: webArchiveUploadTransport,
  });
}

async function startArchiveUpload(totalBytes: number, userId: string, accessToken: string) {
  const response = await nitroFetch(`${getBaseUrl()}/activity/migration-strava/${userId}/start`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ uploadBytesTotal: totalBytes }),
  });

  const body = await response.text();
  if (!response.ok) throw new MigrationArchiveTransferError(getUploadResponseError(response.status, body));
  return parseJobResponse(body);
}

function parseJobResponse(body: string): ActivityMigrationJobResponse {
  try {
    const response = JSON.parse(body) as ActivityMigrationJobResponse;
    if (!response.jobId) throw new Error('Сервер не вернул идентификатор задачи миграции');
    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Некорректный ответ сервера');
  }
}

function getUploadResponseError(status: number, body: string) {
  try {
    const parsed = JSON.parse(body) as { message?: string | string[]; error?: string };
    const message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message || parsed.error;
    if (message) return message;
  } catch {
    // Use the HTTP status when the server response is not JSON.
  }
  return `Сервер вернул статус ${status}`;
}

function getBaseUrl() {
  return process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:3000';
}
