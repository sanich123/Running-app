import AsyncStorage from '@react-native-async-storage/async-storage';

export const DISTANCE_STORAGE = 'distance';

export async function getDistance(): Promise<number> {
  const distance = await AsyncStorage.getItem(DISTANCE_STORAGE);
  return distance ? JSON.parse(distance) : 0;
}

export async function setDistance(distance: number): Promise<void> {
  await AsyncStorage.setItem(DISTANCE_STORAGE, JSON.stringify(distance));
}

export async function addDistance(currentDistance: number): Promise<number> {
  const existing = await getDistance();
  const distance = existing + currentDistance;
  await setDistance(distance);
  console.log('[duration], added duration - ', distance);
  return distance;
}

export async function clearDistance(): Promise<void> {
  await AsyncStorage.removeItem(DISTANCE_STORAGE);
  console.log('[duration], cleared');
}
