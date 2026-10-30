import {
  deleteSavedActivityTrack,
  encodeActivityLocationsAsGpx,
  getSavedActivityTrackFile,
  listSavedActivityTracks,
  readSavedActivityTrack,
  renameSavedActivityTrack,
  saveActivityTrack,
} from './track-library';
import type { ActivityLocation } from '@S/card/types';

jest.mock('expo-file-system', () => {
  const fileContents = new Map<string, string>();
  class MockDirectory {
    uri: string;

    constructor(parent: { uri: string }, name: string) {
      this.uri = `${parent.uri}/${name}`;
    }

    create() {
      if (!this.uri) throw new Error('Invalid directory URI');
    }
  }
  class MockFile {
    uri: string;

    constructor(parent: { uri: string }, name: string) {
      this.uri = `${parent.uri}/${name}`;
    }

    get exists() {
      return fileContents.has(this.uri);
    }

    create() {
      if (!fileContents.has(this.uri)) fileContents.set(this.uri, '');
    }

    async write(contents: string | Uint8Array) {
      fileContents.set(this.uri, typeof contents === 'string' ? contents : Array.from(contents).join(','));
    }

    async text() {
      const contents = fileContents.get(this.uri);
      if (contents === undefined) throw new Error('Missing file');
      return contents;
    }

    delete() {
      fileContents.delete(this.uri);
    }
  }
  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: { uri: 'file:///documents' } },
    __mockFiles: fileContents,
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

const mockFiles = jest.requireMock('expo-file-system') as { __mockFiles: Map<string, string> };
const mockStorage = jest.requireMock('@U/storage/storage') as { __mockStorage: Map<string, string> };
const TRACK_INDEX_KEY = 'saved-activity-tracks:v1';
const locations: ActivityLocation[] = [
  {
    coords: { latitude: 55.7, longitude: 37.6, altitude: 150 },
    timestamp: Date.parse('2026-10-29T06:00:00.000Z'),
  },
  { coords: { latitude: 55.8, longitude: 37.7, altitude: null } },
];

describe('activity track library', () => {
  beforeEach(() => {
    mockFiles.__mockFiles.clear();
    mockStorage.__mockStorage.clear();
  });

  it('saves route JSON, GPX and FIT files with metadata and reads them back', async () => {
    const track = await saveActivityTrack({
      activityId: 'run-1',
      title: '  Morning <run>  ',
      date: '2026-10-29T06:00:00.000Z',
      sport: 'running',
      locations: [...locations, { coords: { latitude: Number.NaN, longitude: 37 } }],
    });

    expect(track).toEqual(
      expect.objectContaining({
        id: 'activity-run-1',
        activityId: 'run-1',
        title: 'Morning <run>',
        date: '2026-10-29T06:00:00.000Z',
        pointCount: 2,
        sport: 'running',
        distanceMeters: expect.any(Number),
      }),
    );
    expect(mockStorage.__mockStorage.get(TRACK_INDEX_KEY)).toContain(track.title);
    expect(mockFiles.__mockFiles.get('file:///documents/runich-tracks/activity-run-1.json')).toContain('55.7');
    expect(mockFiles.__mockFiles.get('file:///documents/runich-tracks/activity-run-1.gpx')).toContain(
      'Morning &lt;run&gt;',
    );
    expect(mockFiles.__mockFiles.get('file:///documents/runich-tracks/activity-run-1.fit')).toMatch(/^\d+,/);
    await expect(readSavedActivityTrack(track.id)).resolves.toHaveLength(2);
    await expect(listSavedActivityTracks()).resolves.toEqual([track]);
  });

  it('uses a default title and rejects a route with fewer than two valid points', async () => {
    const track = await saveActivityTrack({
      activityId: 'run-2',
      title: '  ',
      date: '2026-10-29T06:00:00.000Z',
      locations,
    });
    expect(track.title).toBe('Активность Runich');
    await expect(
      saveActivityTrack({ activityId: 'run-3', title: 'bad route', date: 'now', locations: [locations[0]!] }),
    ).rejects.toThrow('Маршрут активности не содержит двух корректных точек');
    expect(() => encodeActivityLocationsAsGpx('Empty', [locations[0]!])).toThrow(
      'Для экспорта GPX нужно не менее двух точек маршрута',
    );
  });

  it('filters malformed index entries and tolerates missing or malformed indexes', async () => {
    await expect(listSavedActivityTracks()).resolves.toEqual([]);
    mockStorage.__mockStorage.set(TRACK_INDEX_KEY, '{bad json');
    await expect(listSavedActivityTracks()).resolves.toEqual([]);
    mockStorage.__mockStorage.set(TRACK_INDEX_KEY, JSON.stringify([{ id: 'missing' }, { id: 'activity-run-4' }]));
    await expect(listSavedActivityTracks()).resolves.toEqual([]);
  });

  it('filters malformed saved points and reports a missing route file', async () => {
    const trackId = 'activity-run-5';
    mockFiles.__mockFiles.set(
      `file:///documents/runich-tracks/${trackId}.json`,
      JSON.stringify([locations[0], null, { coords: { latitude: 'bad', longitude: 37 } }, locations[1]]),
    );
    await expect(readSavedActivityTrack(trackId)).resolves.toEqual([locations[0], locations[1]]);
    await expect(readSavedActivityTrack('missing')).rejects.toThrow();
    await expect(getSavedActivityTrackFile('missing', 'gpx')).rejects.toThrow('Файл маршрута не найден на устройстве');
  });

  it('renames saved metadata and deletes all route files', async () => {
    const track = await saveActivityTrack({
      activityId: 'run-6',
      title: 'Park',
      date: '2026-10-29T06:00:00.000Z',
      locations,
    });
    await expect(renameSavedActivityTrack(track.id, '  Forest  ')).resolves.toEqual([{ ...track, title: 'Forest' }]);
    await expect(renameSavedActivityTrack(track.id, '  ')).rejects.toThrow('Введите название маршрута');
    await expect(getSavedActivityTrackFile(track.id, 'gpx')).resolves.toMatchObject({
      uri: `file:///documents/runich-tracks/${track.id}.gpx`,
    });
    await expect(deleteSavedActivityTrack(track.id)).resolves.toEqual([]);
    expect(mockFiles.__mockFiles.has(`file:///documents/runich-tracks/${track.id}.json`)).toBe(false);
    expect(mockFiles.__mockFiles.has(`file:///documents/runich-tracks/${track.id}.gpx`)).toBe(false);
    expect(mockFiles.__mockFiles.has(`file:///documents/runich-tracks/${track.id}.fit`)).toBe(false);
  });
});
