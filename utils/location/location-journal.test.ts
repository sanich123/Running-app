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
});
