import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';

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
    const accessToken = await AsyncStorage.getItem('accessToken');
    setIsSendingArchive(true);
    await uploadAsync(
      `${process.env.EXPO_PUBLIC_BASE_URL}/activity/migration-strava/${userId}`,
      `file://${pathToArchive}`,
      {
        fieldName: 'archive',
        httpMethod: 'POST',
        uploadType: FileSystemUploadType.MULTIPART,
        headers: { authorization: `Bearer ${accessToken}` },
      },
    );
  } catch (error) {
    setIsError(`Ошибка во время отправки архива. ${JSON.stringify(error)}`);
    console.log(error);
  } finally {
    setIsSendingArchive(false);
  }
}
