import { toFileUri } from './uri-tools';

const MIGRATION_ARCHIVE_REQUEST_TIMEOUT = 5 * 60 * 1000;

async function sendArchiveRequestWeb(formData: FormData, userId: string, accessToken: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MIGRATION_ARCHIVE_REQUEST_TIMEOUT);

  let response: Response;
  try {
    response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/migration-strava/${userId}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}` },
      body: formData,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Сервер вернул статус ${response.status}`);
  }
}

function sendArchiveRequestNative(formData: FormData, userId: string, accessToken: string) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${process.env.EXPO_PUBLIC_BASE_URL}/activity/migration-strava/${userId}`);
    request.timeout = MIGRATION_ARCHIVE_REQUEST_TIMEOUT;
    request.setRequestHeader('authorization', `Bearer ${accessToken}`);
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
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
  setIsError,
  pathToArchive,
  userId,
  accessToken,
}: {
  setIsSendingArchive: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  pathToArchive: string;
  userId: string;
  accessToken: string;
}) {
  try {
    setIsSendingArchive(true);
    const formData = new FormData();
    formData.append('archive', {
      uri: toFileUri(pathToArchive),
      name: 'archiveToSend.zip',
      type: 'application/zip',
    } as unknown as Blob);
    await sendArchiveRequestNative(formData, userId, accessToken);
  } catch (error) {
    setIsError(`Ошибка во время отправки архива. ${JSON.stringify(error)}`);
    throw error;
  } finally {
    setIsSendingArchive(false);
  }
}

export async function sendArchiveToServerWeb({
  archiveFile,
  setIsSendingArchive,
  setIsError,
  userId,
  accessToken,
}: {
  archiveFile: Blob & { name?: string };
  setIsSendingArchive: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  userId: string;
  accessToken: string;
}) {
  try {
    setIsSendingArchive(true);
    const formData = new FormData();
    formData.append('archive', archiveFile, archiveFile.name || 'archiveToSend.zip');
    await sendArchiveRequestWeb(formData, userId, accessToken);
  } catch (error) {
    setIsError(`Ошибка во время отправки архива. ${JSON.stringify(error)}`);
    throw error;
  } finally {
    setIsSendingArchive(false);
  }
}
