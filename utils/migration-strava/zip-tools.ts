import { cacheDirectory, deleteAsync, getInfoAsync } from 'expo-file-system';
import { unzip, zip } from 'react-native-zip-archive';

export async function unzipFiles({
  uriToUnzip,
  setIsUnzipping,
  setIsError,
}: {
  uriToUnzip: string;
  setIsUnzipping: (arg: boolean) => void;
  setIsError: (arg: string) => void;
}) {
  try {
    setIsUnzipping(true);
    const unzippedFolderPath = await unzip(uriToUnzip, `${cacheDirectory}stravaMigration`, 'UTF-8');
    setIsUnzipping(false);
    return unzippedFolderPath;
  } catch (error) {
    console.log(error);
    setIsError(`Ошибка при разархивировании, ${JSON.stringify(error)}`);
  }
}

export async function zipFiles({
  setIsZipping,
  setIsError,
}: {
  setIsZipping: (arg: boolean) => void;
  setIsError: (arg: string) => void;
}) {
  try {
    setIsZipping(true);
    const existingArchive = await getInfoAsync(`${cacheDirectory}archiveToSend.zip`);
    if (existingArchive.exists) {
      await deleteAsync(`${cacheDirectory}archiveToSend.zip`);
    }
    const pathToArchive = await zip(`${cacheDirectory}stravaMigration`, `${cacheDirectory}archiveToSend.zip`);
    setIsZipping(false);
    return pathToArchive;
  } catch (error) {
    console.log(error);
    setIsError(`Ошибка при архивировании, ${JSON.stringify(error)}`);
  }
}
