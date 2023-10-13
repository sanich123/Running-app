import AsyncStorage from '@react-native-async-storage/async-storage';

export const DURATION_STORAGE = 'duration';

export async function getDuration(): Promise<number> {
  const duration = await AsyncStorage.getItem(DURATION_STORAGE);
  return duration ? JSON.parse(duration) : 0;
}

export async function setDuration(duration: number): Promise<void> {
  await AsyncStorage.setItem(DURATION_STORAGE, JSON.stringify(duration));
}

export async function addDuration(currentDuration: number): Promise<number> {
  const existing = await getDuration();
  const duration = existing + currentDuration;
  await setDuration(duration);
  console.log('[duration], added duration - ', duration);
  return duration;
}

export async function clearDuration(): Promise<void> {
  await AsyncStorage.removeItem(DURATION_STORAGE);
  console.log('[duration], cleared');
}
