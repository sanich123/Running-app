import { Directory, Paths } from 'expo-file-system';
import { deleteAsync } from 'expo-file-system/legacy';
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
    if (new Directory(mediaUri).exists) {
      setIsRemovingMedia(true);
      await deleteAsync(mediaUri);
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
    if (new Directory(migrationDirectoryUri).exists) {
      setIsDeletingCacheFolder?.(true);
      await deleteAsync(migrationDirectoryUri);
      setIsDeletingCacheFolder?.(false);
    }
  } catch (error) {
    setIsError?.(`Ошибка при удалении папки кэша, ${JSON.stringify(error)}`);
    throw error;
  }
}
