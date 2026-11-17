import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { LANGUAGES } from '@const/enums';
import {
  clearPendingRawRouteUploads,
  clearUnsyncedActivities,
  queuePendingRawRouteUpload,
  queueUnsyncedActivity,
} from '@R/slices/activity/activity';
import { changeLanguage } from '@R/slices/settings/settings';
import { clearTrackingRecovery, startTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { MOCK_UNSYNCED_ACTIVITY } from '@T/mocks/mock-unsynced-activity';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import {
  appendLocationToJournal,
  createLocationJournal,
  readLocationJournal,
  removeLocationJournal,
} from '@U/location/location-journal';
import UnsendedActivitiesIndicator from './unsended-activities-indicator';

describe('unsended activities indicator', () => {
  beforeEach(() => {
    mockStore.dispatch(clearUnsyncedActivities());
    mockStore.dispatch(clearPendingRawRouteUploads());
    mockStore.dispatch(clearTrackingRecovery());
  });

  it('does not render when there are no failed sends', async () => {
    await renderWithProviders(<UnsendedActivitiesIndicator />);

    expect(screen.queryByTestId('send-unsynced-activities')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('delete-unsynced-activities')).not.toBeOnTheScreen();
  });

  it('uses singular English copy for one pending item', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    await renderWithProviders(<UnsendedActivitiesIndicator />);

    expect(screen.getByText('1 saved activity or routes')).toBeOnTheScreen();
  });

  it('uses plural English copy for multiple pending items', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    mockStore.dispatch(queueUnsyncedActivity({ ...MOCK_UNSYNCED_ACTIVITY, id: 'another-unsynced-activity' }));
    await renderWithProviders(<UnsendedActivitiesIndicator />);

    expect(screen.getByText('2 saved activities or routes')).toBeOnTheScreen();
  });

  it('handles activity state from an older persisted version without route queues', async () => {
    const persistedState = mockStore.getState();
    const legacyState = {
      ...persistedState,
      activity: {
        ...persistedState.activity,
        unsyncedActivities: undefined,
        pendingRawRouteUploads: undefined,
      } as unknown as typeof persistedState.activity,
    };
    const stateSpy = jest.spyOn(mockStore, 'getState').mockReturnValue(legacyState);

    try {
      await renderWithProviders(<UnsendedActivitiesIndicator />);

      expect(screen.queryByTestId('send-unsynced-activities')).not.toBeOnTheScreen();
    } finally {
      stateSpy.mockRestore();
    }
  });

  it('retries an unsynced activity and removes it after success', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(queueUnsyncedActivity(MOCK_UNSYNCED_ACTIVITY));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await user.press(screen.getByTestId('send-unsynced-activities'));
    await waitFor(() => expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0));
  });

  it('keeps an unsynced activity queued when its route journal is missing', async () => {
    mockStore.dispatch(queueUnsyncedActivity({ ...MOCK_UNSYNCED_ACTIVITY, routeJournalId: 'missing-journal' }));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await userEvent.press(screen.getByTestId('send-unsynced-activities'));

    expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(1);
  });

  it('queues a raw route only after its upload fails while retrying an activity', async () => {
    const routeJournalId = createLocationJournal();
    appendLocationToJournal(routeJournalId, { ...MOCK_LOCATION, timestamp: 1_000 });
    mockStore.dispatch(queueUnsyncedActivity({ ...MOCK_UNSYNCED_ACTIVITY, routeJournalId }));
    mockStore.dispatch(startTrackingRecovery(routeJournalId));
    server.use(
      http.post(`${BASE_URL}/activity/${MOCK_UNSYNCED_ACTIVITY.id}`, () =>
        HttpResponse.json({ id: 'saved-activity-id' }, { status: 201 }),
      ),
      http.post(`${BASE_URL}/activity/saved-activity-id/locations/raw`, () =>
        HttpResponse.json({ message: 'Upload failed' }, { status: 503 }),
      ),
    );

    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await userEvent.press(screen.getByTestId('send-unsynced-activities'));

    await waitFor(() => expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0));
    await waitFor(() => expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(1));
    expect(mockStore.getState().trackingRecovery.journalId).toBeNull();
    expect(readLocationJournal(routeJournalId)?.pointCount).toBe(1);
    removeLocationJournal(routeJournalId);
  });

  it('keeps a failed route queued when its local journal is unavailable', async () => {
    mockStore.dispatch(
      queuePendingRawRouteUpload({
        activityId: 'saved-activity-id',
        routeJournalId: 'missing-journal',
        title: 'Saved route',
        date: '2026-10-29T06:00:00.000Z',
        sport: 'run',
      }),
    );
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await userEvent.press(screen.getByTestId('send-unsynced-activities'));

    expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(1);
  });

  it('clears route recovery and its journal when discarding a failed route', async () => {
    const routeJournalId = createLocationJournal();
    appendLocationToJournal(routeJournalId, MOCK_LOCATION);
    mockStore.dispatch(
      queuePendingRawRouteUpload({
        activityId: 'saved-activity-id',
        routeJournalId,
        title: 'Saved route',
        date: '2026-10-29T06:00:00.000Z',
        sport: 'run',
      }),
    );
    mockStore.dispatch(startTrackingRecovery(routeJournalId));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await userEvent.press(screen.getByTestId('delete-unsynced-activities'));

    expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(0);
    expect(mockStore.getState().trackingRecovery.journalId).toBeNull();
    expect(readLocationJournal(routeJournalId)).toBeNull();
  });

  it('clears route recovery and its journal when discarding a tracked activity', async () => {
    const routeJournalId = createLocationJournal();
    appendLocationToJournal(routeJournalId, MOCK_LOCATION);
    mockStore.dispatch(queueUnsyncedActivity({ ...MOCK_UNSYNCED_ACTIVITY, routeJournalId }));
    mockStore.dispatch(startTrackingRecovery(routeJournalId));
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await userEvent.press(screen.getByTestId('delete-unsynced-activities'));

    expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0);
    expect(mockStore.getState().trackingRecovery.journalId).toBeNull();
    expect(readLocationJournal(routeJournalId)).toBeNull();
  });

  it('preserves a different tracking recovery after restoring a queued route', async () => {
    const routeJournalId = createLocationJournal();
    appendLocationToJournal(routeJournalId, MOCK_LOCATION);
    mockStore.dispatch(queueUnsyncedActivity({ ...MOCK_UNSYNCED_ACTIVITY, routeJournalId }));
    mockStore.dispatch(startTrackingRecovery('another-journal'));
    server.use(
      http.post(`${BASE_URL}/activity/${MOCK_UNSYNCED_ACTIVITY.id}`, () =>
        HttpResponse.json({ id: 'saved-activity-id' }, { status: 201 }),
      ),
      http.post(`${BASE_URL}/activity/saved-activity-id/locations/raw`, () => new HttpResponse(null, { status: 204 })),
    );
    await renderWithProviders(<UnsendedActivitiesIndicator />);
    await userEvent.press(screen.getByTestId('send-unsynced-activities'));

    await waitFor(() => expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0));
    await waitFor(() => expect(readLocationJournal(routeJournalId)).toBeNull());
    expect(mockStore.getState().trackingRecovery.journalId).toBe('another-journal');
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
