const memoryStorage = new Map<string, string>();

const getStorage = () => (typeof localStorage === 'undefined' ? null : localStorage);

export const appStorage = {
  async getItem(key: string) {
    return getStorage()?.getItem(key) ?? memoryStorage.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    const storage = getStorage();
    if (storage) storage.setItem(key, value);
    else memoryStorage.set(key, value);
  },
  async removeItem(key: string) {
    const storage = getStorage();
    if (storage) storage.removeItem(key);
    memoryStorage.delete(key);
  },
};
