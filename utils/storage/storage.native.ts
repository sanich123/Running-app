import { createMMKV } from 'react-native-mmkv';
import { reportPersistenceError } from '@R/persistence-errors';

const storage = createMMKV({ id: 'runich-storage' });

export const appStorage = {
  async getItem(key: string) {
    return storage.getString(key) ?? null;
  },
  async setItem(key: string, value: string) {
    try {
      storage.set(key, value);
    } catch (error) {
      reportPersistenceError(`Не удалось сохранить данные в MMKV (${key})`, error);
      throw error;
    }
  },
  async removeItem(key: string) {
    try {
      storage.remove(key);
    } catch (error) {
      reportPersistenceError(`Не удалось удалить данные из MMKV (${key})`, error);
      throw error;
    }
  },
};
