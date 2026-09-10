import { SPORTS_BTNS_VALUES } from '@const/sports';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { MOCK_UNSYNCED_ACTIVITY } from '@T/mocks/mock-unsynced-activity';
import reducer, {
  addPhotoUrl,
  clearUnsyncedActivities,
  queueUnsyncedActivity,
  setFinishedActivity,
  setSavingDisabled,
  setSport,
} from './activity';
import { ACTIVITY_INITIAL_STATE } from './const';

describe('Activity slice', () => {
  const MOCK_FINISHED_ACTIVITY = {
    duration: MOCK_DURATION,
    speed: MOCK_SPEED,
    distance: MOCK_DISTANCE,
    kilometresSplit: MOCK_ACTIVITY.kilometresSplit,
    routeJournalId: null,
  };
  it('should handle initial state properly', () => {
    expect(reducer(undefined, { type: '' })).toEqual(ACTIVITY_INITIAL_STATE);
  });

  it('should correctly change isSavingDisabled', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, setSavingDisabled(true))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      isSavingDisabled: true,
    });
  });

  it('should change finishedActivity', () => {
    expect(reducer(ACTIVITY_INITIAL_STATE, setFinishedActivity(MOCK_FINISHED_ACTIVITY))).toEqual({
      ...ACTIVITY_INITIAL_STATE,
      finishedActivity: MOCK_FINISHED_ACTIVITY,
    });
  });

  it('should manage the activity draft', () => {
    const photo = { url: 'photo-url', thumbnail: null };
    const withSport = reducer(ACTIVITY_INITIAL_STATE, setSport(SPORTS_BTNS_VALUES.bike));
    const withPhoto = reducer(withSport, addPhotoUrl(photo));

    expect(withPhoto.sport).toBe(SPORTS_BTNS_VALUES.bike);
    expect(withPhoto.photoVideoUrls).toEqual([photo]);
  });

  it('should queue and clear unsynced activities', () => {
    const queued = reducer(ACTIVITY_INITIAL_STATE, queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));

    expect(queued.unsyncedActivities).toEqual([MOCK_UNSYNCED_ACTIVITY]);
    expect(reducer(queued, clearUnsyncedActivities()).unsyncedActivities).toEqual([]);
  });
});
