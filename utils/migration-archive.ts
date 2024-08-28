import { getDocumentAsync } from 'expo-document-picker';
import { showCrossPlatformToast } from './custom-toast';
import { unzip, zip } from 'react-native-zip-archive';
import {
  FileSystemUploadType,
  cacheDirectory,
  deleteAsync,
  getInfoAsync,
  uploadAsync,
} from 'expo-file-system';

export async function getMigrationArchiveAndSendToServer() {
  try {
    const file = await getDocumentAsync();

    if (!file?.canceled) {
      const uriToUnzip = file?.assets[0].uri;
      showCrossPlatformToast('Получили адрес архива на телефоне');
      const unzippedFolderPath = await unzip(uriToUnzip, `${cacheDirectory}stravaMigration`, 'UTF-8');
      showCrossPlatformToast('Распаковали');
      await deleteAsync(`file://${unzippedFolderPath}/media`);
      showCrossPlatformToast('Удалили медиа');
      const pathToArchive = await zip(`${cacheDirectory}stravaMigration`, `${cacheDirectory}archiveToSend.zip`);
      showCrossPlatformToast('Создали новый архив');
      const fileInfo = await getInfoAsync(`file://${pathToArchive}`);

      if (fileInfo.exists) {
        sendArchiveToServer(pathToArchive);
        showCrossPlatformToast('Послали архив на сервер');
        await deleteAsync(`${cacheDirectory}/stravaMigration`);
        showCrossPlatformToast('Удалили ненужные файлы');
      } else {
        showCrossPlatformToast('Нет файла для отправки');
      }
    }
  } catch (error) {
    console.log(error);
    showCrossPlatformToast(JSON.stringify(error));
  }
}

async function sendArchiveToServer(path: string) {
  try {
    return await uploadAsync(`http://192.168.1.7:4000/activity/migration-strava`, `file://${path}`, {
      fieldName: 'archive',
      httpMethod: 'POST',
      uploadType: FileSystemUploadType.MULTIPART,
    });
  } catch (error) {
    console.log(error);
  }
}
