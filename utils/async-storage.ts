import AsyncStorage from '@react-native-async-storage/async-storage';

import { errorHandler } from './error-handler';

export const storeData = async (value: any, key: string) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    errorHandler(e);
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(value);
  } catch (e) {
    errorHandler(e);
  }
};
