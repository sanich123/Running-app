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
});
