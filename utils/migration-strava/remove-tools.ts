import { Directory, Paths } from 'expo-file-system';
import { reportMigrationError, toFileUri } from './utils';

export async function removeMedia({
  pathToMedia,
  setIsRemovingMedia,
  setIsError,
}: {
  pathToMedia: string;
  setIsRemovingMedia: (arg: boolean) => void;
  setIsError: (arg: string) => void;
}) {
  try {
    const mediaUri = `${toFileUri(pathToMedia)}/media`;
    const mediaDirectory = new Directory(mediaUri);
    if (mediaDirectory.exists) {
      setIsRemovingMedia(true);
      mediaDirectory.delete();
    }
  } catch (error) {
    throw reportMigrationError('Ошибка при удалении медиа', error, setIsError);
  } finally {
    setIsRemovingMedia(false);
  }
}

export async function removeCacheFolder({
  setIsDeletingCacheFolder,
  setIsError,
}: {
  setIsDeletingCacheFolder?: (arg: boolean) => void;
  setIsError?: (arg: string) => void;
}) {
  try {
    const migrationDirectoryUri = `${Paths.cache.uri}stravaMigration`;
    const migrationDirectory = new Directory(migrationDirectoryUri);
    if (migrationDirectory.exists) {
      setIsDeletingCacheFolder?.(true);
      migrationDirectory.delete();
    }
  } catch (error) {
    throw reportMigrationError('Ошибка при удалении папки кэша', error, setIsError ?? (() => undefined));
  } finally {
    setIsDeletingCacheFolder?.(false);
  }
}
