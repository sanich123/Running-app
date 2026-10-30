import { appStorage } from '@U/storage/storage';

const OFFLINE_MAPS_INDEX_KEY = 'saved-offline-maps:v1';
const offlineMapListeners = new Set<() => void>();

export function subscribeToOfflineMaps(listener: () => void) {
  offlineMapListeners.add(listener);
  return () => {
    offlineMapListeners.delete(listener);
  };
}

function notifyOfflineMapsChanged() {
  offlineMapListeners.forEach((listener) => listener());
}

export interface SavedOfflineMap {
  id: string;
  title: string;
  sizeBytes?: number;
}

function parseOfflineMaps(value: string | null) {
  if (!value) return [];
  try {
    const maps = JSON.parse(value) as SavedOfflineMap[];
    return Array.isArray(maps) ? maps.filter((map) => typeof map.id === 'string' && typeof map.title === 'string') : [];
  } catch {
    return [];
  }
}

export async function listSavedOfflineMaps() {
  return parseOfflineMaps(await appStorage.getItem(OFFLINE_MAPS_INDEX_KEY));
}

export async function saveOfflineMap(map: SavedOfflineMap) {
  const maps = await listSavedOfflineMaps();
  const updatedMaps = [map, ...maps.filter(({ id }) => id !== map.id)];
  await appStorage.setItem(OFFLINE_MAPS_INDEX_KEY, JSON.stringify(updatedMaps));
  notifyOfflineMapsChanged();
  return updatedMaps;
}

export async function renameOfflineMap(id: string, title: string) {
  const updatedTitle = title.trim();
  if (!updatedTitle) throw new Error('Введите название региона');
  const maps = await listSavedOfflineMaps();
  const updatedMaps = maps.map((map) => (map.id === id ? { ...map, title: updatedTitle } : map));
  await appStorage.setItem(OFFLINE_MAPS_INDEX_KEY, JSON.stringify(updatedMaps));
  notifyOfflineMapsChanged();
  return updatedMaps;
}

export async function removeOfflineMap(id: string) {
  const maps = await listSavedOfflineMaps();
  const updatedMaps = maps.filter((map) => map.id !== id);
  await appStorage.setItem(OFFLINE_MAPS_INDEX_KEY, JSON.stringify(updatedMaps));
  notifyOfflineMapsChanged();
  return updatedMaps;
}
