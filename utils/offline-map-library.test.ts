import {
  listSavedOfflineMaps,
  removeOfflineMap,
  renameOfflineMap,
  saveOfflineMap,
  subscribeToOfflineMaps,
} from './offline-map-library';

jest.mock('@U/storage/storage', () => {
  const values = new Map<string, string>();
  return {
    appStorage: {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => void values.set(key, value),
    },
    __mockStorage: values,
  };
});

const mockStorage = jest.requireMock('@U/storage/storage') as { __mockStorage: Map<string, string> };
const OFFLINE_MAPS_INDEX_KEY = 'saved-offline-maps:v1';

describe('offline map library', () => {
  beforeEach(() => {
    mockStorage.__mockStorage.clear();
  });

  it('returns only valid entries from saved map data', async () => {
    mockStorage.__mockStorage.set(
      OFFLINE_MAPS_INDEX_KEY,
      JSON.stringify([
        { id: 'region-1', title: 'Moscow' },
        { id: '', title: 'Empty id' },
        { id: 'region-2', title: 42 },
        null,
      ]),
    );
    expect(await listSavedOfflineMaps()).toEqual([{ id: 'region-1', title: 'Moscow' }]);

    mockStorage.__mockStorage.set(OFFLINE_MAPS_INDEX_KEY, '{invalid json');
    expect(await listSavedOfflineMaps()).toEqual([]);
    mockStorage.__mockStorage.set(OFFLINE_MAPS_INDEX_KEY, JSON.stringify({ id: 'region-1', title: 'Moscow' }));
    expect(await listSavedOfflineMaps()).toEqual([]);
  });

  it('saves, renames and removes maps while notifying the list', async () => {
    const onMapsChanged = jest.fn();
    const unsubscribe = subscribeToOfflineMaps(onMapsChanged);

    await saveOfflineMap({ id: 'region-1', title: 'First name' });
    await saveOfflineMap({ id: 'region-1', title: 'Second name' });
    expect(await listSavedOfflineMaps()).toEqual([{ id: 'region-1', title: 'Second name' }]);

    await renameOfflineMap('region-1', '  Central  ');
    expect(await listSavedOfflineMaps()).toEqual([{ id: 'region-1', title: 'Central' }]);

    await removeOfflineMap('region-1');
    expect(await listSavedOfflineMaps()).toEqual([]);
    expect(onMapsChanged).toHaveBeenCalledTimes(4);
    expect(mockStorage.__mockStorage.get(OFFLINE_MAPS_INDEX_KEY)).toBe('[]');
    unsubscribe();
  });

  it('rejects empty map names and stops notifying after unsubscribe', async () => {
    const onMapsChanged = jest.fn();
    const unsubscribe = subscribeToOfflineMaps(onMapsChanged);
    await expect(renameOfflineMap('region-1', '  ')).rejects.toThrow('Введите название региона');

    unsubscribe();
    await saveOfflineMap({ id: 'region-1', title: 'Moscow' });
    expect(onMapsChanged).not.toHaveBeenCalled();
  });
});
