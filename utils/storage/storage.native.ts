import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'runich-storage' });

export const appStorage = {
  async getItem(key: string) {
    return storage.getString(key) ?? null;
  },
  async setItem(key: string, value: string) {
    storage.set(key, value);
  },
  async removeItem(key: string) {
    storage.remove(key);
  },
};
