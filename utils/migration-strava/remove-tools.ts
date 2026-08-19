import { Directory, Paths } from 'expo-file-system';
import { toFileUri } from './uri-tools';

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
      setIsRemovingMedia(false);
    }
  } catch (error) {
    setIsError(`Ошибка при удалении медиа, ${JSON.stringify(error)}`);
    throw error;
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
      setIsDeletingCacheFolder?.(false);
    }
  } catch (error) {
    setIsError?.(`Ошибка при удалении папки кэша, ${JSON.stringify(error)}`);
    throw error;
  }
}
