import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File } from 'expo-file-system';
import { removeCacheFolder, removeMedia } from './remove-tools';
import { sendArchiveToServer } from './send-tools';
import { toFileUri } from './uri-tools';
import { unzipFiles, zipFiles } from './zip-tools';
import type { GetMigrationArchiveAndSendToServerProps } from './types';

export async function getMigrationArchiveAndSendToServer({
  setIsDisabled,
  setIsUnzipping,
  setIsRemovingMedia,
  setIsZipping,
  setIsSendingArchive,
  setIsDeletingCacheFolder,
  setIsSuccess,
  setIsError,
  userId,
  accessToken,
}: GetMigrationArchiveAndSendToServerProps) {
  try {
    const file = await getDocumentAsync();
    if (!file.canceled) {
      setIsDisabled(true);
      const uriToUnzip = file.assets?.[0]?.uri;
      if (!uriToUnzip) {
        throw new Error('Выбранный файл не найден');
      }

      const unzippedFolderPath = await unzipFiles({ uriToUnzip, setIsUnzipping, setIsError });
      if (!unzippedFolderPath) {
        throw new Error('Не удалось разархивировать файл');
      }

      const unzippedFolderUri = toFileUri(unzippedFolderPath);
      await removeMedia({ pathToMedia: unzippedFolderUri, setIsRemovingMedia, setIsError });

      const activitiesCsv = new File(`${unzippedFolderUri}/activities.csv`);
      if (new Directory(`${unzippedFolderUri}/activities`).exists && activitiesCsv.exists) {
        const pathToArchive = await zipFiles({ setIsZipping, setIsError });
        if (!pathToArchive) {
          throw new Error('Не удалось создать архив');
        }
        if (new File(toFileUri(pathToArchive)).exists) {
          await sendArchiveToServer({ setIsSendingArchive, setIsError, pathToArchive, userId, accessToken });
          await removeCacheFolder({ setIsDeletingCacheFolder, setIsError });
          setIsSuccess(true);
          setIsDisabled(false);
        } else {
          throw new Error('Нет файла для отправки');
        }
      } else {
        throw new Error('Невозможно обработать этот архив, нет папки с активностями');
      }
    }
  } catch (error) {
    try {
      await removeCacheFolder({});
    } catch {
      // Preserve the original error; cleanup is best effort after a failure.
    }
    setIsError(`Ошибка ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  } finally {
    setIsDisabled(false);
    setIsUnzipping(false);
    setIsRemovingMedia(false);
    setIsZipping(false);
    setIsSendingArchive(false);
    setIsDeletingCacheFolder(false);
    setTimeout(() => setIsSuccess(false), 2000);
    setTimeout(() => setIsError(''), 2000);
  }
}
