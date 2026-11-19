import {
  listSavedOfflineMaps,
  removeOfflineMap,
  renameOfflineMap,
  saveOfflineMap,
  saveOfflineMapThumbnail,
  subscribeToOfflineMaps,
} from './offline-map-library';

jest.mock('expo-file-system', () => {
  const files = new Map<string, string>();
  const directories = new Set<string>();
  class MockDirectory {
    uri: string;

    constructor(parent: { uri: string }, name: string) {
      this.uri = `${parent.uri}/${name}`;
    }

    create() {
      directories.add(this.uri);
    }
  }
  class MockFile {
    uri: string;

    constructor(uriOrParent: string | { uri: string }, name?: string) {
      this.uri = typeof uriOrParent === 'string' ? uriOrParent : `${uriOrParent.uri}/${name}`;
    }

    get exists() {
      return files.has(this.uri);
    }

    delete() {
      files.delete(this.uri);
    }

    async copy(destination: MockFile) {
      const contents = files.get(this.uri);
      if (contents === undefined) throw new Error('Missing source file');
      files.set(destination.uri, contents);
    }
  }
  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: { uri: 'file:///documents' } },
    __mockFiles: files,
    __mockDirectories: directories,
  };
});

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
const mockFiles = jest.requireMock('expo-file-system') as {
  __mockFiles: Map<string, string>;
  __mockDirectories: Set<string>;
};
const OFFLINE_MAPS_INDEX_KEY = 'saved-offline-maps:v1';

describe('offline map library', () => {
  beforeEach(() => {
    mockStorage.__mockStorage.clear();
    mockFiles.__mockFiles.clear();
    mockFiles.__mockDirectories.clear();
  });

  it('returns only valid entries from saved map data', async () => {
    mockStorage.__mockStorage.set(
      OFFLINE_MAPS_INDEX_KEY,
      JSON.stringify([
        { id: 'region-1', title: 'Moscow' },
        { id: '', title: 'Empty id' },
        { id: 'region-2', title: 42 },
        { id: 'region-3', title: 'Invalid thumbnail', thumbnailAspectRatio: 'wide' },
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

  it('stores a thumbnail for a saved map and removes its temporary snapshot', async () => {
    await saveOfflineMap({ id: 'region/1', title: 'Moscow' });
    mockFiles.__mockFiles.set('file:///cache/region.png', 'thumbnail');

    const thumbnailUri = await saveOfflineMapThumbnail('region/1', 'file:///cache/region.png', 0.62);
    const expectedThumbnailUri = 'file:///documents/offline-map-thumbnails/region%2F1.png';

    expect(thumbnailUri).toBe(expectedThumbnailUri);
    expect(mockFiles.__mockFiles.get(expectedThumbnailUri)).toBe('thumbnail');
    expect(mockFiles.__mockFiles.has('file:///cache/region.png')).toBe(false);
    expect(await listSavedOfflineMaps()).toEqual([
      {
        id: 'region/1',
        title: 'Moscow',
        thumbnailUri: expectedThumbnailUri,
        thumbnailAspectRatio: 0.62,
      },
    ]);
  });

  it('cleans up a temporary thumbnail when its saved map no longer exists', async () => {
    mockFiles.__mockFiles.set('file:///cache/orphan.png', 'thumbnail');

    await expect(saveOfflineMapThumbnail('deleted-region', 'file:///cache/orphan.png', 0.62)).resolves.toBeUndefined();

    expect(mockFiles.__mockFiles.has('file:///cache/orphan.png')).toBe(false);
    expect(await listSavedOfflineMaps()).toEqual([]);
  });
});
