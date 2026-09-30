import { createMMKV } from 'react-native-mmkv';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import {
  appendLocationToJournal,
  createLocationJournal,
  deactivateLocationJournal,
  getActiveLocationJournalId,
  getLocationJournalProgress,
  markLocationJournalPause,
  readLocationJournal,
  removeLocationJournal,
} from './location-journal';

const journalStorage = createMMKV({ id: 'runich-location-journal' });

describe('location journal', () => {
  it('stores points, preserves pause segments, and can be deactivated without deleting data', () => {
    const journalId = createLocationJournal();
    const firstLocation = { ...MOCK_LOCATION, timestamp: 1_000 };
    const secondLocation = { ...MOCK_LOCATION, timestamp: 2_000 };
    const thirdLocation = { ...MOCK_LOCATION, timestamp: 3_000 };

    expect(appendLocationToJournal(journalId, firstLocation)).toBe(true);
    expect(appendLocationToJournal(journalId, secondLocation)).toBe(true);
    expect(appendLocationToJournal(journalId, secondLocation)).toBe(false);
    markLocationJournalPause(journalId);
    expect(appendLocationToJournal(journalId, thirdLocation)).toBe(true);

    expect(getLocationJournalProgress(journalId)).toEqual({ pointCount: 3, lastTimestamp: 3_000 });
    expect(readLocationJournal(journalId)).toEqual({
      locations: [firstLocation, secondLocation, thirdLocation],
      segments: [[firstLocation, secondLocation], [thirdLocation]],
      pointCount: 3,
    });
    expect(getActiveLocationJournalId()).toBe(journalId);

    deactivateLocationJournal(journalId);
    expect(getActiveLocationJournalId()).toBeNull();
    expect(readLocationJournal(journalId)?.pointCount).toBe(3);

    removeLocationJournal(journalId);
    expect(readLocationJournal(journalId)).toBeNull();
  });

  it('handles missing journals and leaves an empty journal readable without adding empty pause segments', () => {
    expect(appendLocationToJournal('missing-journal', MOCK_LOCATION)).toBe(false);
    expect(getLocationJournalProgress('missing-journal')).toBeNull();
    expect(readLocationJournal('missing-journal')).toBeNull();
    markLocationJournalPause('missing-journal');
    deactivateLocationJournal('missing-journal');
    removeLocationJournal('missing-journal');

    const journalId = createLocationJournal();
    markLocationJournalPause(journalId);
    expect(getLocationJournalProgress(journalId)).toEqual({ pointCount: 0, lastTimestamp: null });
    expect(readLocationJournal(journalId)).toEqual({ locations: [], segments: [[]], pointCount: 0 });

    deactivateLocationJournal(journalId);
    removeLocationJournal(journalId);
  });

  it('uses coordinate timestamps, rejects stale points, and stores points across chunk boundaries', () => {
    const journalId = createLocationJournal();
    const makeLocation = (timestamp: number, includeTopLevelTimestamp = true) =>
      ({
        ...MOCK_LOCATION,
        timestamp: includeTopLevelTimestamp ? timestamp : undefined,
        coords: { ...MOCK_LOCATION.coords, timestamp, altitude: null, altitudeAccuracy: null },
      }) as unknown as typeof MOCK_LOCATION;

    expect(appendLocationToJournal(journalId, makeLocation(10_000, false))).toBe(true);
    expect(appendLocationToJournal(journalId, makeLocation(10_000))).toBe(false);
    expect(appendLocationToJournal(journalId, makeLocation(9_000))).toBe(false);

    for (let index = 1; index <= 32; index += 1) {
      expect(appendLocationToJournal(journalId, makeLocation(10_000 + index * 1_000))).toBe(true);
    }

    const snapshot = readLocationJournal(journalId);
    expect(getLocationJournalProgress(journalId)).toEqual({ pointCount: 33, lastTimestamp: 42_000 });
    expect(snapshot?.locations).toHaveLength(33);
    expect(snapshot?.segments).toHaveLength(1);
    expect(snapshot?.locations[0]).toMatchObject({ timestamp: 10_000 });
    expect(snapshot?.locations[0].coords).not.toHaveProperty('altitude');
    expect(snapshot?.locations[0].coords).not.toHaveProperty('altitudeAccuracy');

    removeLocationJournal(journalId);
  });

  it('does not clear another active journal when removing a previously deactivated journal', () => {
    const firstJournalId = createLocationJournal();
    deactivateLocationJournal(firstJournalId);
    const activeJournalId = createLocationJournal();

    removeLocationJournal(firstJournalId);

    expect(getActiveLocationJournalId()).toBe(activeJournalId);
    removeLocationJournal(activeJournalId);
  });

  it('ignores corrupt metadata and chunks instead of exposing partial journal data', () => {
    const journalId = 'corrupt-journal';
    const metadataKey = `${journalId}:meta`;
    const chunkKey = `${journalId}:chunk:0`;

    journalStorage.set(metadataKey, '{broken json');
    expect(readLocationJournal(journalId)).toBeNull();

    for (const invalidMeta of [
      { version: 2, pointCount: 0, chunkCount: 0, segmentStarts: [0] },
      { version: 1, pointCount: 0.5, chunkCount: 0, segmentStarts: [0] },
      { version: 1, pointCount: 0, chunkCount: Number.NaN, segmentStarts: [0] },
      { version: 1, pointCount: 0, chunkCount: 0, segmentStarts: 'invalid' },
    ]) {
      journalStorage.set(metadataKey, JSON.stringify(invalidMeta));
      expect(readLocationJournal(journalId)).toBeNull();
    }

    journalStorage.set(metadataKey, JSON.stringify({ version: 1, pointCount: 1, chunkCount: 1, segmentStarts: [0] }));
    journalStorage.set(chunkKey, '{broken json');
    expect(readLocationJournal(journalId)).toEqual({ locations: [], segments: [[]], pointCount: 1 });

    journalStorage.set(chunkKey, JSON.stringify({ not: 'an array' }));
    expect(readLocationJournal(journalId)).toEqual({ locations: [], segments: [[]], pointCount: 1 });
    removeLocationJournal(journalId);
  });

  it('round-trips available coordinate fields and falls back to the current timestamp', () => {
    const journalId = createLocationJournal();
    const now = jest.spyOn(Date, 'now').mockReturnValue(50_000);
    const locationWithoutTimestamp = {
      ...MOCK_LOCATION,
      timestamp: undefined,
      coords: { ...MOCK_LOCATION.coords, timestamp: undefined },
    } as unknown as typeof MOCK_LOCATION;
    expect(appendLocationToJournal(journalId, locationWithoutTimestamp)).toBe(true);

    const detailedLocation = {
      ...MOCK_LOCATION,
      timestamp: 51_000,
      coords: {
        ...MOCK_LOCATION.coords,
        latitude: 55.75,
        longitude: 37.62,
        altitude: 156,
        altitudeAccuracy: 2,
        accuracy: 3,
        heading: 90,
        speed: 4,
      },
    };
    expect(appendLocationToJournal(journalId, detailedLocation)).toBe(true);

    const snapshot = readLocationJournal(journalId);
    expect(snapshot?.locations[0]?.timestamp).toBe(50_000);
    expect(snapshot?.locations[1]).toMatchObject({
      timestamp: 51_000,
      coords: {
        latitude: 55.75,
        longitude: 37.62,
        altitude: 156,
        altitudeAccuracy: 2,
        accuracy: 3,
        heading: 90,
        speed: 4,
      },
    });

    now.mockRestore();
    removeLocationJournal(journalId);
  });

  it('omits unavailable coordinate fields and keeps the empty-segment fallback', () => {
    const journalId = createLocationJournal();
    const sparseLocation = {
      ...MOCK_LOCATION,
      timestamp: 60_000,
      coords: {
        ...MOCK_LOCATION.coords,
        altitude: null,
        altitudeAccuracy: null,
        accuracy: null,
        heading: null,
        speed: null,
      },
    } as unknown as typeof MOCK_LOCATION;
    expect(appendLocationToJournal(journalId, sparseLocation)).toBe(true);
    expect(readLocationJournal(journalId)?.locations[0]?.coords).not.toHaveProperty('accuracy');
    expect(readLocationJournal(journalId)?.locations[0]?.coords).not.toHaveProperty('heading');
    expect(readLocationJournal(journalId)?.locations[0]?.coords).not.toHaveProperty('speed');
    removeLocationJournal(journalId);

    const emptySegmentsId = 'empty-segments-journal';
    journalStorage.set(
      `${emptySegmentsId}:meta`,
      JSON.stringify({ version: 1, pointCount: 0, chunkCount: 0, segmentStarts: [] }),
    );
    expect(readLocationJournal(emptySegmentsId)).toEqual({ locations: [], segments: [[]], pointCount: 0 });
    removeLocationJournal(emptySegmentsId);
  });
});
