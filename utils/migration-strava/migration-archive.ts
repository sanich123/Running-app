import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File } from 'expo-file-system';
import { Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { removeCacheFolder, removeMedia } from './remove-tools';
import {
  isMigrationArchiveCancelledError,
  isMigrationArchiveTransferError,
  MigrationArchiveCancelledError,
  sendArchiveToServer,
  sendArchiveToServerWeb,
} from './send-tools';
import { toFileUri } from './uri-tools';
import { unzipFiles, zipFiles } from './zip-tools';
import type { GetMigrationArchiveAndSendToServerProps, MigrationCancelHandler } from './types';

export async function getMigrationArchiveAndSendToServer({
  setIsDisabled,
  setIsUnzipping,
  setIsRemovingMedia,
  setIsZipping,
  setIsSendingArchive,
  setIsWaitingForServer,
  setIsDeletingCacheFolder,
  setUploadProgress,
  setIsError,
  onCancelReady,
  onArchiveUploadAccepted,
  userId,
  accessToken,
}: GetMigrationArchiveAndSendToServerProps) {
  let isCancelled = false;
  let cancelRequest: MigrationCancelHandler = null;
  const cancel = () => {
    isCancelled = true;
    cancelRequest?.();
  };
  const throwIfCancelled = () => {
    if (isCancelled) throw new MigrationArchiveCancelledError();
  };

  try {
    const file = await getDocumentAsync();
    if (!file.canceled) {
      setIsDisabled(true);
      onCancelReady(cancel);
      setUploadProgress(0);
      throwIfCancelled();
      const selectedAsset = file.assets?.[0];
      if (Platform.OS === 'web') {
        if (!selectedAsset?.file) {
          throw new Error('Выбранный файл недоступен в браузере');
        }

        const job = await sendArchiveToServerWeb({
          archiveFile: selectedAsset.file,
          setIsSendingArchive,
          setIsWaitingForServer,
          setUploadProgress,
          onCancelReady: (requestCancel) => {
            cancelRequest = requestCancel;
          },
          setIsError,
          userId,
          accessToken,
        });
        throwIfCancelled();
        onArchiveUploadAccepted(job);
        onCancelReady(null);
        setIsDisabled(false);
        return;
      }

      const uriToUnzip = selectedAsset?.uri;
      if (!uriToUnzip) {
        throw new Error('Выбранный файл не найден');
      }

      const unzippedFolderPath = await unzipFiles({ uriToUnzip, setIsUnzipping, setIsError });
      throwIfCancelled();
      if (!unzippedFolderPath) {
        throw new Error('Не удалось разархивировать файл');
      }

      const unzippedFolderUri = toFileUri(unzippedFolderPath);
      await removeMedia({ pathToMedia: unzippedFolderUri, setIsRemovingMedia, setIsError });
      throwIfCancelled();

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
            setUploadProgress,
            onCancelReady: (requestCancel) => {
              cancelRequest = requestCancel;
            },
            setIsError,
            pathToArchive,
            userId,
            accessToken,
          });
          throwIfCancelled();
          onArchiveUploadAccepted(job);
          onCancelReady(null);
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
    if (!isMigrationArchiveCancelledError(error) && !isMigrationArchiveTransferError(error)) {
      setIsError(`Ошибка ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      errorToast('Ошибка миграции из Strava', error);
    }
  } finally {
    onCancelReady(null);
    setIsDisabled(false);
    setUploadProgress(0);
    setIsUnzipping(false);
    setIsRemovingMedia(false);
    setIsZipping(false);
    setIsSendingArchive(false);
    setIsWaitingForServer(false);
    setIsDeletingCacheFolder(false);
  }
}
