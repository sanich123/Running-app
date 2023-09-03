import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';

export async function getFromAsyncStorage(property: string) {
  try {
    const result = await AsyncStorage.getItem(property);
    if (result) {
      return JSON.parse(result);
    }
    return result;
  } catch (error) {
    ToastAndroid.show(`An error occured during getting from AsyncStorage. ${error.message}`, ToastAndroid.SHORT);
  }
}

export async function setToAsyncStorage(property: string, value: object | string) {
  try {
    const stringifiedValue = JSON.stringify(value);
    return await AsyncStorage.setItem(property, stringifiedValue);
  } catch (error) {
    ToastAndroid.show(`An error occured during getting from AsyncStorage. ${error.message}`, ToastAndroid.SHORT);
  }
}
