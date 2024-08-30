import { FileSystemUploadType, uploadAsync } from 'expo-file-system';

export async function sendArchiveToServer({
  setIsSendingArchive,
  setIsError,
  pathToArchive,
  userId,
}: {
  setIsSendingArchive: (arg: boolean) => void;
  setIsError: (arg: string) => void;
  pathToArchive: string;
  userId: string;
}) {
  try {
    setIsSendingArchive(true);
    await uploadAsync(`http://192.168.1.3:4000/activity/migration-strava/${userId}`, `file://${pathToArchive}`, {
      fieldName: 'archive',
      httpMethod: 'POST',
      uploadType: FileSystemUploadType.MULTIPART,
    });
    setIsSendingArchive(false);
  } catch (error) {
    setIsError(`Ошибка во время отправки архива. ${JSON.stringify(error)}`);
    console.log(error);
  }
}
