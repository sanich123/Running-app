import { toFileUri } from './uri-tools';
import type { ActivityMigrationJobResponse } from '@R/runich-api/types';

const MIGRATION_ARCHIVE_REQUEST_TIMEOUT = 5 * 60 * 1000;

function sendArchiveRequest(
  formData: FormData,
  userId: string,
  accessToken: string,
  setIsWaitingForServer: (arg: boolean) => void,
): Promise<ActivityMigrationJobResponse> {
  return new Promise<ActivityMigrationJobResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${process.env.EXPO_PUBLIC_BASE_URL}/activity/migration-strava/${userId}`);
    request.timeout = MIGRATION_ARCHIVE_REQUEST_TIMEOUT;
    request.setRequestHeader('authorization', `Bearer ${accessToken}`);
    let isWaiting = false;
    const startWaitingForServer = () => {
      if (!isWaiting) {
        isWaiting = true;
        setIsWaitingForServer(true);
      }
    };
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0 && event.loaded >= event.total) {
        startWaitingForServer();
      }
    };
    request.upload.onload = startWaitingForServer;
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        try {
          const response = JSON.parse(request.responseText) as ActivityMigrationJobResponse;
          if (!response.jobId) throw new Error('Сервер не вернул идентификатор задачи миграции');
          resolve(response);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Некорректный ответ сервера'));
        }
      } else {
        reject(new Error(`Сервер вернул статус ${request.status}`));
      }
    };
    request.onerror = () => reject(new Error('Не удалось отправить архив на сервер'));
    request.ontimeout = () => reject(new Error('Истекло время ожидания ответа сервера (5 минут)'));
    request.onabort = () => reject(new Error('Отправка архива отменена'));
    request.send(formData);
  });
}

export async function sendArchiveToServer({
  setIsSendingArchive,
  setIsWaitingForServer,
  setIsError,
  pathToArchive,
  userId,
  accessToken,
}: {
  setIsSendingArchive: (arg: boolean) => void;
  setIsWaitingForServer: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  pathToArchive: string;
  userId: string;
  accessToken: string;
}): Promise<ActivityMigrationJobResponse> {
  try {
    setIsSendingArchive(true);
    setIsWaitingForServer(false);
    const formData = new FormData();
    formData.append('archive', {
      uri: toFileUri(pathToArchive),
      name: 'archiveToSend.zip',
      type: 'application/zip',
    } as unknown as Blob);
    return await sendArchiveRequest(formData, userId, accessToken, setIsWaitingForServer);
  } catch (error) {
    setIsError(`Ошибка во время отправки архива. ${JSON.stringify(error)}`);
    throw error;
  } finally {
    setIsSendingArchive(false);
    setIsWaitingForServer(false);
  }
}

export async function sendArchiveToServerWeb({
  archiveFile,
  setIsSendingArchive,
  setIsWaitingForServer,
  setIsError,
  userId,
  accessToken,
}: {
  archiveFile: Blob & { name?: string };
  setIsSendingArchive: (arg: boolean) => void;
  setIsWaitingForServer: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  userId: string;
  accessToken: string;
}): Promise<ActivityMigrationJobResponse> {
  try {
    setIsSendingArchive(true);
    setIsWaitingForServer(false);
    const formData = new FormData();
    formData.append('archive', archiveFile, archiveFile.name || 'archiveToSend.zip');
    return await sendArchiveRequest(formData, userId, accessToken, setIsWaitingForServer);
  } catch (error) {
    setIsError(`Ошибка во время отправки архива. ${JSON.stringify(error)}`);
    throw error;
  } finally {
    setIsSendingArchive(false);
    setIsWaitingForServer(false);
  }
}
