import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getKeyFromAsyncStorage(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(value);
    return value;
  } catch (error) {
    console.log(error);
  }
}
