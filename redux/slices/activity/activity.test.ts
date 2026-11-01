import { SPORTS_BTNS_VALUES } from '@const/sports';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { MOCK_UNSYNCED_ACTIVITY } from '@T/mocks/mock-unsynced-activity';
import reducer, {
  addPhotoUrl,
  clearUnsyncedActivities,
  finishMediaUpload,
  removePhotoUrl,
  queuePendingRawRouteUpload,
  queueUnsyncedActivity,
  removePendingRawRouteUpload,
  setFinishedActivity,
  startMediaUpload,
  setSavingDisabled,
  setSport,
} from './activity';
import { ACTIVITY_INITIAL_STATE } from './const';
import type { ActivityState } from './types';

describe('Activity slice', () => {
  const MOCK_PENDING_RAW_ROUTE_UPLOAD = {
    activityId: 'activity-1',
    routeJournalId: 'journal-1',
    title: 'Morning run',
    date: '2026-11-01T10:00:00.000Z',
    sport: 'run',
  };
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

  it('tracks concurrent media uploads until all have finished', () => {
    const firstUploadStarted = reducer(ACTIVITY_INITIAL_STATE, startMediaUpload());
    const secondUploadStarted = reducer(firstUploadStarted, startMediaUpload());
    const firstUploadFinished = reducer(secondUploadStarted, finishMediaUpload());

    expect(firstUploadFinished.activeMediaUploadCount).toBe(1);
    expect(reducer(firstUploadFinished, finishMediaUpload()).activeMediaUploadCount).toBe(0);
    expect(reducer(ACTIVITY_INITIAL_STATE, finishMediaUpload()).activeMediaUploadCount).toBe(0);
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
    expect(withPhoto.media).toEqual([photo]);
  });

  it('removes photos by ID, asset ID, or URL', () => {
    const photos = [
      { id: 'photo-id', url: 'photo-url', assetId: 'photo-asset' },
      { id: 'other-photo-id', url: 'other-photo-url', assetId: 'other-photo-asset' },
    ];
    const withPhotos = { ...ACTIVITY_INITIAL_STATE, media: photos };

    expect(reducer(withPhotos, removePhotoUrl({ id: 'photo-id' })).media).toEqual([photos[1]]);
    expect(reducer(withPhotos, removePhotoUrl({ assetId: 'photo-asset' })).media).toEqual([photos[1]]);
    expect(reducer(withPhotos, removePhotoUrl({ url: 'photo-url' })).media).toEqual([photos[1]]);
  });

  it('should queue and clear unsynced activities', () => {
    const queued = reducer(ACTIVITY_INITIAL_STATE, queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));

    expect(queued.unsyncedActivities).toEqual([MOCK_UNSYNCED_ACTIVITY]);
    expect(reducer(queued, clearUnsyncedActivities()).unsyncedActivities).toEqual([]);
  });

  it('queues a raw route upload once and removes it after completion', () => {
    const queued = reducer(ACTIVITY_INITIAL_STATE, queuePendingRawRouteUpload(MOCK_PENDING_RAW_ROUTE_UPLOAD));
    const duplicate = reducer(queued, queuePendingRawRouteUpload(MOCK_PENDING_RAW_ROUTE_UPLOAD));

    expect(duplicate.pendingRawRouteUploads).toEqual([MOCK_PENDING_RAW_ROUTE_UPLOAD]);
    expect(
      reducer(duplicate, removePendingRawRouteUpload(MOCK_PENDING_RAW_ROUTE_UPLOAD.activityId)).pendingRawRouteUploads,
    ).toEqual([]);
  });

  it('restores a missing raw route queue before adding a failed upload', () => {
    const legacyState = { ...ACTIVITY_INITIAL_STATE, pendingRawRouteUploads: undefined } as unknown as ActivityState;

    expect(
      reducer(legacyState, queuePendingRawRouteUpload(MOCK_PENDING_RAW_ROUTE_UPLOAD)).pendingRawRouteUploads,
    ).toEqual([MOCK_PENDING_RAW_ROUTE_UPLOAD]);
    expect(
      reducer(legacyState, removePendingRawRouteUpload(MOCK_PENDING_RAW_ROUTE_UPLOAD.activityId))
        .pendingRawRouteUploads,
    ).toEqual([]);
  });
});
