import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import {
  clearPendingRawRouteUploads,
  clearUnsyncedActivities,
  queuePendingRawRouteUpload,
  queueUnsyncedActivity,
} from '@R/slices/activity/activity';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { MOCK_UNSYNCED_ACTIVITY } from '@T/mocks/mock-unsynced-activity';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { appendLocationToJournal, createLocationJournal, readLocationJournal } from '@U/location/location-journal';
import UnsendedActivitiesIndicator from './unsended-activities-indicator';

describe('unsended activities indicator', () => {
  beforeEach(() => {
    mockStore.dispatch(clearUnsyncedActivities());
    mockStore.dispatch(clearPendingRawRouteUploads());
  });

  it('retries an unsynced activity and removes it after success', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('send-unsynced-activities'));
    await waitFor(() => expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0));
  });

  it('allows the user to discard unsynced activities', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('delete-unsynced-activities'));
    expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0);
  });

  it('keeps a failed raw-route upload saved and lets the user retry it later', async () => {
    const routeJournalId = createLocationJournal();
    appendLocationToJournal(routeJournalId, { ...MOCK_LOCATION, timestamp: 1_000 });
    appendLocationToJournal(routeJournalId, { ...MOCK_LOCATION, timestamp: 2_000 });
    mockStore.dispatch(
      queuePendingRawRouteUpload({
        activityId: 'saved-activity-id',
        routeJournalId,
        title: 'Saved route',
        date: '2026-10-29T06:00:00.000Z',
        sport: 'run',
      }),
    );
    server.use(
      http.post(`${BASE_URL}/activity/saved-activity-id/locations/raw`, () =>
        HttpResponse.json({ message: 'Upload failed' }, { status: 503 }),
      ),
    );
    const user = userEvent.setup();
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('send-unsynced-activities'));

    await waitFor(() => expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(1));
    expect(readLocationJournal(routeJournalId)?.pointCount).toBe(2);

    server.use(
      http.post(`${BASE_URL}/activity/saved-activity-id/locations/raw`, () => new HttpResponse(null, { status: 204 })),
    );
    await user.press(screen.getByTestId('send-unsynced-activities'));

    await waitFor(() => expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(0));
    expect(readLocationJournal(routeJournalId)).toBeNull();
  });
});
