import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File } from 'expo-file-system';
import { Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { removeCacheFolder, removeMedia } from './remove-tools';
import { sendArchiveToServer, sendArchiveToServerWeb } from './send-tools';
import { toFileUri } from './uri-tools';
import { unzipFiles, zipFiles } from './zip-tools';
import type { GetMigrationArchiveAndSendToServerProps } from './types';

export async function getMigrationArchiveAndSendToServer({
  setIsDisabled,
  setIsUnzipping,
  setIsRemovingMedia,
  setIsZipping,
  setIsSendingArchive,
  setIsWaitingForServer,
  setIsDeletingCacheFolder,
  setIsError,
  onArchiveUploadAccepted,
  userId,
  accessToken,
}: GetMigrationArchiveAndSendToServerProps) {
  try {
    const file = await getDocumentAsync();
    if (!file.canceled) {
      setIsDisabled(true);
      const selectedAsset = file.assets?.[0];
      if (Platform.OS === 'web') {
        if (!selectedAsset?.file) {
          throw new Error('Выбранный файл недоступен в браузере');
        }

        const job = await sendArchiveToServerWeb({
          archiveFile: selectedAsset.file,
          setIsSendingArchive,
          setIsWaitingForServer,
          setIsError,
          userId,
          accessToken,
        });
        onArchiveUploadAccepted(job);
        setIsDisabled(false);
        return;
      }

      const uriToUnzip = selectedAsset?.uri;
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
          const job = await sendArchiveToServer({
            setIsSendingArchive,
            setIsWaitingForServer,
            setIsError,
            pathToArchive,
            userId,
            accessToken,
          });
          onArchiveUploadAccepted(job);
          await removeCacheFolder({ setIsDeletingCacheFolder, setIsError });
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
    errorToast('Ошибка миграции из Strava', error);
  } finally {
    setIsDisabled(false);
    setIsUnzipping(false);
    setIsRemovingMedia(false);
    setIsZipping(false);
    setIsSendingArchive(false);
    setIsWaitingForServer(false);
    setIsDeletingCacheFolder(false);
    setTimeout(() => setIsError(''), 2000);
  }
}
