import AsyncStorage from '@react-native-async-storage/async-storage';
import { showCrossPlatformToast } from './custom-toast';

export async function setAccessTokenToStorage(accessToken: string) {
  try {
    await await AsyncStorage.setItem('accessToken', accessToken);
  } catch {
    showCrossPlatformToast('Во время сохранения токена произошла ошибка');
  }
}
