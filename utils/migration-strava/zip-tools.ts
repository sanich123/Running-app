import { File, Paths } from 'expo-file-system';
import { unzip, zip } from 'react-native-zip-archive';
import { reportMigrationError } from './utils';

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
    return unzippedFolderPath;
  } catch (error) {
    throw reportMigrationError('Ошибка при разархивировании', error, setIsError);
  } finally {
    setIsUnzipping(false);
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
    const archiveFile = new File(archiveUri);
    if (archiveFile.exists) {
      archiveFile.delete();
    }
    const pathToArchive = await zip(`${Paths.cache.uri}stravaMigration`, archiveUri);
    return pathToArchive;
  } catch (error) {
    throw reportMigrationError('Ошибка при архивировании', error, setIsError);
  } finally {
    setIsZipping(false);
  }
}
