import { Directory, File, Paths } from 'expo-file-system';
import { appStorage } from '@U/storage/storage';

const OFFLINE_MAPS_INDEX_KEY = 'saved-offline-maps:v1';
const OFFLINE_MAP_THUMBNAILS_DIRECTORY = 'offline-map-thumbnails';
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
  thumbnailUri?: string;
  thumbnailAspectRatio?: number;
}

function getOfflineMapThumbnailFile(id: string) {
  return new File(new Directory(Paths.document, OFFLINE_MAP_THUMBNAILS_DIRECTORY), `${encodeURIComponent(id)}.png`);
}

function parseOfflineMaps(value: string | null) {
  if (!value) return [];
  try {
    const maps = JSON.parse(value) as SavedOfflineMap[];
    return Array.isArray(maps)
      ? maps.filter((map) => typeof map?.id === 'string' && Boolean(map.id) && typeof map?.title === 'string')
      : [];
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

export async function saveOfflineMapThumbnail(id: string, sourceUri: string, aspectRatio: number) {
  const maps = await listSavedOfflineMaps();
  const savedMap = maps.find(({ id: savedMapId }) => savedMapId === id);
  const sourceFile = new File(sourceUri);
  if (!savedMap) {
    try {
      if (sourceFile.exists) sourceFile.delete();
    } catch {
      // A temporary snapshot can remain in cache if cleanup is unavailable.
    }
    return undefined;
  }

  const directory = new Directory(Paths.document, OFFLINE_MAP_THUMBNAILS_DIRECTORY);
  directory.create({ idempotent: true, intermediates: true });
  const thumbnailFile = getOfflineMapThumbnailFile(id);
  await sourceFile.copy(thumbnailFile, { overwrite: true });
  try {
    if (sourceFile.uri !== thumbnailFile.uri && sourceFile.exists) sourceFile.delete();
  } catch {
    // A temporary snapshot can remain in cache if cleanup is unavailable.
  }

  const updatedMaps = maps.map((map) =>
    map.id === id ? { ...map, thumbnailUri: thumbnailFile.uri, thumbnailAspectRatio: aspectRatio } : map,
  );
  await appStorage.setItem(OFFLINE_MAPS_INDEX_KEY, JSON.stringify(updatedMaps));
  notifyOfflineMapsChanged();
  return thumbnailFile.uri;
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
  try {
    const thumbnailFile = getOfflineMapThumbnailFile(id);
    if (thumbnailFile.exists) thumbnailFile.delete();
  } catch {
    // Removing the map from the library should succeed even if thumbnail cleanup fails.
  }
  notifyOfflineMapsChanged();
  return updatedMaps;
}
