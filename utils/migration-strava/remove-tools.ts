import { cacheDirectory, deleteAsync, getInfoAsync } from 'expo-file-system';

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
    const mediaFolder = await getInfoAsync(`file://${pathToMedia}/media`);
    if (mediaFolder.exists) {
      setIsRemovingMedia(true);
      await deleteAsync(`file://${pathToMedia}/media`);
      setIsRemovingMedia(false);
    }
  } catch (error) {
    console.log(error);
    setIsError(`Ошибка при удалении медиа, ${JSON.stringify(error)}`);
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
    const migrationDirectoryInfo = await getInfoAsync(`${cacheDirectory}/stravaMigration`);
    if (migrationDirectoryInfo.exists) {
      setIsDeletingCacheFolder?.(true);
      await deleteAsync(`${cacheDirectory}/stravaMigration`);
      setIsDeletingCacheFolder?.(false);
    }
  } catch (error) {
    console.log(error);
    setIsError?.(`Ошибка при удалении папки кэша, ${JSON.stringify(error)}`);
  }
}
