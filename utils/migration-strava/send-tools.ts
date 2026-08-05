import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';
import { toFileUri } from './uri-tools';

export async function sendArchiveToServer({
  setIsSendingArchive,
  setIsError,
  pathToArchive,
  userId,
  accessToken,
}: {
  setIsSendingArchive: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  pathToArchive: string;
  userId: string;
  accessToken: string;
}) {
  try {
    setIsSendingArchive(true);
    const response = await uploadAsync(
      `${process.env.EXPO_PUBLIC_BASE_URL}/activity/migration-strava/${userId}`,
      toFileUri(pathToArchive),
      {
        fieldName: 'archive',
        httpMethod: 'POST',
        uploadType: FileSystemUploadType.MULTIPART,
        headers: { authorization: `Bearer ${accessToken}` },
      },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Сервер вернул статус ${response.status}`);
    }
  } catch (error) {
    setIsError(`Ошибка во время отправки архива. ${JSON.stringify(error)}`);
    throw error;
  } finally {
    setIsSendingArchive(false);
  }
}
