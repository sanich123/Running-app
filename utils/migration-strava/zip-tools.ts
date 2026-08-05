import { File, Paths } from 'expo-file-system';
import { deleteAsync } from 'expo-file-system/legacy';
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
    const unzippedFolderPath = await unzip(uriToUnzip, `${Paths.cache.uri}stravaMigration`, 'UTF-8');
    setIsUnzipping(false);
    return unzippedFolderPath;
  } catch (error) {
    setIsError(`Ошибка при разархивировании, ${JSON.stringify(error)}`);
    throw error;
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
    const archiveUri = `${Paths.cache.uri}archiveToSend.zip`;
    if (new File(archiveUri).exists) {
      await deleteAsync(archiveUri);
    }
    const pathToArchive = await zip(`${Paths.cache.uri}stravaMigration`, archiveUri);
    setIsZipping(false);
    return pathToArchive;
  } catch (error) {
    setIsError(`Ошибка при архивировании, ${JSON.stringify(error)}`);
    throw error;
  }
}
