import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File as ExpoFile } from 'expo-file-system';
import { Platform } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';
import { removeCacheFolder, removeMedia } from './remove-tools';
import {
  isMigrationArchiveCancelledError,
  isMigrationArchiveTransferError,
  sendArchiveToServer,
  sendArchiveToServerWeb,
} from './send-tools';
import {
  createMigrationCancellation,
  getMigrationErrorMessage,
  isMigrationArchiveOperationError,
  reportMigrationError,
  throwMigrationError,
  toFileUri,
} from './utils';
import { unzipFiles, zipFiles } from './zip-tools';
import type { MigrationCancelHandler, StartStravaMigrationProps } from './types';

interface SelectedArchiveAsset {
  uri?: string;
  file?: Blob & { name?: string };
}

export async function startStravaMigration(migration: StartStravaMigrationProps): Promise<void> {
  const cancellation = createMigrationCancellation();

  try {
    const selectedArchive = await selectMigrationArchive(migration.setIsError);
    // Пользовательская отмена выбора архива — штатный сценарий, уведомление не нужно.
    if (!selectedArchive) return;

    startMigration(migration, cancellation.cancel);
    cancellation.throwIfCancelled();

    if (Platform.OS === 'web') {
      await uploadWebArchive(selectedArchive, migration, cancellation.setCancelRequest, cancellation.throwIfCancelled);
    } else {
      if (!selectedArchive.uri) {
        throwMigrationError('Выбранный файл не найден', migration.setIsError);
      }
      const pathToArchive = await prepareNativeArchive(selectedArchive.uri, migration, cancellation.throwIfCancelled);
      await uploadNativeArchive(pathToArchive, migration, cancellation.setCancelRequest, cancellation.throwIfCancelled);
      await removeCacheFolder({
        setIsDeletingCacheFolder: migration.setIsDeletingCacheFolder,
        setIsError: migration.setIsError,
      });
    }
  } catch (error) {
    await cleanupAfterFailure();
    handleMigrationError(error, migration.setIsError);
  } finally {
    resetMigrationUi(migration);
  }
}

async function selectMigrationArchive(setIsError: (value: string) => void): Promise<SelectedArchiveAsset | null> {
  try {
    const result = await getDocumentAsync();
    if (result.canceled) return null;

    const asset = result.assets?.[0] as SelectedArchiveAsset | undefined;
    if (!asset) throwMigrationError('Архив не выбран', setIsError);
    if (Platform.OS === 'web' && !asset.file) {
      throwMigrationError('Выбранный файл недоступен в браузере', setIsError);
    }
    if (Platform.OS !== 'web' && !asset.uri) throwMigrationError('Выбранный файл не найден', setIsError);
    return asset;
  } catch (error) {
    if (isMigrationArchiveOperationError(error)) throw error;
    throw reportMigrationError('Не удалось выбрать архив Strava', error, setIsError);
  }
}

function startMigration(migration: StartStravaMigrationProps, cancel: () => void) {
  migration.setIsDisabled(true);
  migration.onCancelReady(cancel);
  migration.setUploadProgress(0);
}

async function uploadWebArchive(
  selectedArchive: SelectedArchiveAsset,
  migration: StartStravaMigrationProps,
  setCancelRequest: (cancel: MigrationCancelHandler) => void,
  throwIfCancelled: () => void,
) {
  try {
    if (!selectedArchive.file) {
      throwMigrationError('Выбранный файл недоступен в браузере', migration.setIsError);
    }

    await sendArchiveToServerWeb({
      archiveFile: selectedArchive.file,
      ...getUploadState(migration, setCancelRequest),
      userId: migration.userId,
      accessToken: migration.accessToken,
    });
    throwIfCancelled();
  } catch (error) {
    rethrowReportedMigrationError(error, migration.setIsError, 'Не удалось отправить архив Strava');
  }
}

async function prepareNativeArchive(
  uriToUnzip: string,
  migration: StartStravaMigrationProps,
  throwIfCancelled: () => void,
) {
  try {
    const unzippedFolderPath = await unzipFiles({
      uriToUnzip,
      setIsUnzipping: migration.setIsUnzipping,
      setIsError: migration.setIsError,
    });
    throwIfCancelled();
    if (!unzippedFolderPath) throwMigrationError('Не удалось разархивировать файл', migration.setIsError);

    const unzippedFolderUri = toFileUri(unzippedFolderPath);
    await removeMedia({
      pathToMedia: unzippedFolderUri,
      setIsRemovingMedia: migration.setIsRemovingMedia,
      setIsError: migration.setIsError,
    });
    throwIfCancelled();

    validateUnzippedArchive(unzippedFolderUri, migration.setIsError);
    const pathToArchive = await zipFiles({
      setIsZipping: migration.setIsZipping,
      setIsError: migration.setIsError,
    });
    throwIfCancelled();
    if (!pathToArchive || !new ExpoFile(toFileUri(pathToArchive)).exists) {
      throwMigrationError('Нет файла для отправки', migration.setIsError);
    }
    return pathToArchive;
  } catch (error) {
    rethrowReportedMigrationError(error, migration.setIsError, 'Не удалось подготовить архив Strava');
  }
}

function validateUnzippedArchive(unzippedFolderUri: string, setIsError: (value: string) => void) {
  try {
    const activitiesDirectory = new Directory(`${unzippedFolderUri}/activities`);
    const activitiesCsv = new ExpoFile(`${unzippedFolderUri}/activities.csv`);
    if (!activitiesDirectory.exists || !activitiesCsv.exists) {
      throwMigrationError('Невозможно обработать этот архив, нет папки с активностями', setIsError);
    }
  } catch (error) {
    if (isMigrationArchiveOperationError(error)) throw error;
    throw reportMigrationError('Архив Strava имеет неверную структуру', error, setIsError);
  }
}

async function uploadNativeArchive(
  pathToArchive: string,
  migration: StartStravaMigrationProps,
  setCancelRequest: (cancel: MigrationCancelHandler) => void,
  throwIfCancelled: () => void,
) {
  try {
    await sendArchiveToServer({
      pathToArchive,
      ...getUploadState(migration, setCancelRequest),
      userId: migration.userId,
      accessToken: migration.accessToken,
    });
    throwIfCancelled();
  } catch (error) {
    rethrowReportedMigrationError(error, migration.setIsError, 'Не удалось отправить архив Strava');
  }
}

function getUploadState(
  migration: StartStravaMigrationProps,
  setCancelRequest: (cancel: MigrationCancelHandler) => void,
) {
  return {
    setIsSendingArchive: migration.setIsSendingArchive,
    setIsWaitingForServer: migration.setIsWaitingForServer,
    setUploadProgress: migration.setUploadProgress,
    onCancelReady: setCancelRequest,
    onArchiveUploadAccepted: migration.onArchiveUploadAccepted,
    setIsError: migration.setIsError,
  };
}

function rethrowReportedMigrationError(error: unknown, setIsError: (value: string) => void, message: string): never {
  if (isMigrationArchiveCancelledError(error) || isMigrationArchiveTransferError(error)) throw error;
  if (isMigrationArchiveOperationError(error)) throw error;
  throw reportMigrationError(message, error, setIsError);
}

async function cleanupAfterFailure() {
  try {
    await removeCacheFolder({});
  } catch {
    // Preserve the original error; cleanup is best effort after a failure.
  }
}

function handleMigrationError(error: unknown, setIsError: (value: string) => void) {
  if (isMigrationArchiveCancelledError(error) || isMigrationArchiveTransferError(error)) return;
  if (isMigrationArchiveOperationError(error)) return;

  setIsError(`Ошибка миграции из Strava: ${getMigrationErrorMessage(error)}`);
  errorToast('Ошибка миграции из Strava', error);
}

function resetMigrationUi(migration: StartStravaMigrationProps) {
  migration.onCancelReady(null);
  migration.setIsDisabled(false);
  migration.setUploadProgress(0);
  migration.setIsUnzipping(false);
  migration.setIsRemovingMedia(false);
  migration.setIsZipping(false);
  migration.setIsSendingArchive(false);
  migration.setIsWaitingForServer(false);
  migration.setIsDeletingCacheFolder(false);
}
