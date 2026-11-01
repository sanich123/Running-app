import { clearPendingRawRouteUploads } from '@R/slices/activity/activity';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { appendLocationToJournal, createLocationJournal, readLocationJournal } from '@U/location/location-journal';
import { uploadRawRouteAndQueueOnFailure } from './upload-raw-route';
import type { UploadRawRouteOptions } from './upload-raw-route';

describe('uploadRawRouteAndQueueOnFailure', () => {
  beforeEach(() => mockStore.dispatch(clearPendingRawRouteUploads()));

  it('queues the route when its upload fails', async () => {
    const routeJournalId = createLocationJournal();
    appendLocationToJournal(routeJournalId, MOCK_LOCATION);
    const pendingUpload = {
      activityId: 'activity-1',
      routeJournalId,
      title: 'Morning run',
      date: '2026-11-01T10:00:00.000Z',
      sport: 'run',
    };
    const uploadError = new Error('Upload failed');
    const uploadRawLocations: UploadRawRouteOptions['uploadRawLocations'] = jest.fn(() => ({
      unwrap: () => Promise.reject(uploadError),
    }));

    await expect(
      uploadRawRouteAndQueueOnFailure({
        pendingUpload,
        locations: [MOCK_LOCATION],
        dispatch: mockStore.dispatch,
        uploadRawLocations,
      }),
    ).rejects.toBe(uploadError);

    expect(mockStore.getState().activity.pendingRawRouteUploads).toEqual([pendingUpload]);
    expect(readLocationJournal(routeJournalId)?.locations).toEqual([MOCK_LOCATION]);
    expect(uploadRawLocations).toHaveBeenCalledWith({
      activityId: pendingUpload.activityId,
      locations: [MOCK_LOCATION],
    });
  });

  it('does not queue the route when its upload succeeds', async () => {
    const routeJournalId = createLocationJournal();
    appendLocationToJournal(routeJournalId, MOCK_LOCATION);
    const pendingUpload = {
      activityId: 'activity-1',
      routeJournalId,
      title: 'Morning run',
      date: '2026-11-01T10:00:00.000Z',
      sport: 'run',
    };
    const uploadRawLocations: UploadRawRouteOptions['uploadRawLocations'] = jest.fn(() => ({
      unwrap: () => Promise.resolve(),
    }));

    await uploadRawRouteAndQueueOnFailure({
      pendingUpload,
      locations: [MOCK_LOCATION],
      dispatch: mockStore.dispatch,
      uploadRawLocations,
    });

    expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(0);
    expect(readLocationJournal(routeJournalId)).toBeNull();
  });
});
