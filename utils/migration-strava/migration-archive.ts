import { getDocumentAsync } from 'expo-document-picker';
import { showCrossPlatformToast } from '../custom-toast';
import { getInfoAsync } from 'expo-file-system';
import { unzipFiles, zipFiles } from './zip-tools';
import { removeCacheFolder, removeMedia } from './remove-tools';
import { sendArchiveToServer } from './send-tools';
import { GetMigrationArchiveAndSendToServerProps } from './types';

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
}: GetMigrationArchiveAndSendToServerProps) {
  try {
    const file = await getDocumentAsync();
    if (!file?.canceled) {
      setIsDisabled(true);
      const uriToUnzip = file?.assets[0].uri;
      const unzippedFolderPath = await unzipFiles({ uriToUnzip, setIsUnzipping, setIsError });
      if (unzippedFolderPath) {
        await removeMedia({ pathToMedia: unzippedFolderPath, setIsRemovingMedia, setIsError });
      }
      const pathToArchive = await zipFiles({ setIsZipping, setIsError });
      const fileInfo = await getInfoAsync(`file://${pathToArchive}`);
      if (fileInfo.exists) {
        await sendArchiveToServer({ setIsSendingArchive, setIsError, pathToArchive: `${pathToArchive}`, userId });
        await removeCacheFolder({ setIsDeletingCacheFolder, setIsError });
        setIsSuccess(true);
        setIsDisabled(false);
      } else {
        showCrossPlatformToast('Нет файла для отправки');
      }
    }
  } catch (error) {
    await removeCacheFolder({});
    console.log(error);
    setIsError(`Ошибка ${JSON.stringify(error)}`);
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
