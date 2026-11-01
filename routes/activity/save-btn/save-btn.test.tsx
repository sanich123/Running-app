import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from '@const/activity-save-btn';
import { LANGUAGES, ROUTES } from '@const/enums';
import {
  addPhotoUrls,
  clearUnsyncedActivities,
  finishMediaUpload,
  clearPendingRawRouteUploads,
  resetActivityDraft,
  resetFinishedActivity,
  setFinishedActivity,
  startMediaUpload,
} from '@R/slices/activity/activity';
import { resetAuthSlice } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/settings/settings';
import { errorToast } from '@S/error-toast/error-toast';
import { MOCK_LOCATION, MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import {
  appendLocationToJournal,
  createLocationJournal,
  readLocationJournal,
  removeLocationJournal,
} from '@U/location/location-journal';
import ActivitySaveBtn from './save-btn';
import { isServerUnavailableError } from './utils';

jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));

function createFinishedActivityDraft(routeLocations = [MOCK_LOCATION], routeJournalId = createLocationJournal()) {
  routeLocations.forEach((location, index) => {
    appendLocationToJournal(routeJournalId, { ...location, timestamp: location.timestamp + index + 1 });
  });

  return {
    duration: MOCK_DURATION,
    speed: MOCK_SPEED,
    distance: MOCK_DISTANCE,
    kilometresSplit: [],
    routeJournalId,
  };
}

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockManualActivityMode = 'tracked';
let mockManualActivityId = 'someId';
let mockManualActivityParams = {
  cameraVisible: 'false',
  id: mockManualActivityId,
  manualDate: '2026-08-17T10:00:00.000Z',
  manualDistance: '0',
  manualHours: '0',
  manualMinutes: '0',
  manualSeconds: '0',
  mode: mockManualActivityMode,
};
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => mockManualActivityParams,
  useGlobalSearchParams: () => mockManualActivityParams,
}));

describe('Activity save btn', () => {
  beforeEach(() => {
    mockStore.dispatch(resetAuthSlice());
    mockStore.dispatch(resetActivityDraft());
    mockStore.dispatch(resetFinishedActivity());
    mockBack.mockClear();
    mockReplace.mockClear();
    jest.mocked(errorToast).mockClear();
    mockStore.dispatch(clearUnsyncedActivities());
    mockStore.dispatch(clearPendingRawRouteUploads());
    while (mockStore.getState().activity.activeMediaUploadCount > 0) {
      mockStore.dispatch(finishMediaUpload());
    }
    mockManualActivityMode = 'tracked';
    mockManualActivityId = 'someId';
    mockManualActivityParams = {
      cameraVisible: 'false',
      id: mockManualActivityId,
      manualDate: '2026-08-17T10:00:00.000Z',
      manualDistance: '0',
      manualHours: '0',
      manualMinutes: '0',
      manualSeconds: '0',
      mode: mockManualActivityMode,
    };
  });

  it('classifies transport and gateway failures as server unavailable', () => {
    expect(isServerUnavailableError({ status: 'FETCH_ERROR' })).toBe(true);
    expect(isServerUnavailableError({ status: 'TIMEOUT_ERROR' })).toBe(true);
    expect(isServerUnavailableError({ status: 502 })).toBe(true);
    expect(isServerUnavailableError({ status: 503 })).toBe(true);
    expect(isServerUnavailableError({ status: 'PARSING_ERROR', originalStatus: 503 })).toBe(true);
    expect(isServerUnavailableError({ status: 500 })).toBe(false);
    expect(isServerUnavailableError({ status: 'PARSING_ERROR', originalStatus: 500 })).toBe(false);
  });

  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.english.save)).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.russian.save)).toBeOnTheScreen();
  });

  it('does not save when the user is not authenticated', async () => {
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockStore.getState().activity.isSavingDisabled).toBe(false);
  });

  it('reports when an edited activity has no ID', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockManualActivityMode = 'edit';
    mockManualActivityId = '';
    mockManualActivityParams = { ...mockManualActivityParams, id: '', mode: 'edit' };
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    expect(errorToast).toHaveBeenCalledWith('Не удалось определить активность');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('does not submit a tracked activity without a pace', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    const finishedActivity = createFinishedActivityDraft();
    mockStore.dispatch(
      setFinishedActivity({
        ...finishedActivity,
        speed: 0,
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    expect(errorToast).toHaveBeenCalledWith('Тренировка не имеет скорости или продолжительности');
    expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0);
    removeLocationJournal(finishedActivity.routeJournalId!);
  });

  it('queues manual activities without a route after a network failure', async () => {
    mockStore.dispatch(setMockUserId('someWrongUserId'));
    mockStore.dispatch(
      setFinishedActivity({
        duration: 0,
        speed: 0,
        distance: 0,
        kilometresSplit: [],
        routeJournalId: null,
      }),
    );
    mockManualActivityMode = 'manual';
    mockManualActivityParams = {
      ...mockManualActivityParams,
      manualDistance: '5',
      manualHours: '1',
      mode: 'manual',
    };
    server.use(http.post(`${BASE_URL}/activity/someWrongUserId`, () => HttpResponse.error()));

    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() => expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(1));
    expect(mockStore.getState().activity.unsyncedActivities[0].routeJournalId).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
  });

  it('preserves remote and uploaded media references when saving', async () => {
    let requestBody: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE_URL}/activity/someUserId`, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'saved-activity-id' }, { status: 201 });
      }),
    );
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(
      addPhotoUrls([
        { url: 'remote.jpg', thumbnail: 'remote-thumb.jpg', blurhash: 'blur-hash' },
        { url: 'uploaded.jpg', thumbnail: null, assetId: 'photo-asset', thumbnailAssetId: 'thumb-asset' },
        { thumbnail: null },
      ]),
    );
    mockManualActivityMode = 'manual';
    mockManualActivityParams = {
      ...mockManualActivityParams,
      manualDistance: '5',
      manualHours: '1',
      mode: 'manual',
    };

    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() =>
      expect(requestBody?.media).toEqual([
        { url: 'remote.jpg', thumbnail: 'remote-thumb.jpg', blurhash: 'blur-hash' },
        { thumbnail: null, assetId: 'photo-asset', thumbnailAssetId: 'thumb-asset' },
        { thumbnail: null },
      ]),
    );
  });
  it('should correctly change global state', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isSavingDisabled).toEqual(false);
    await userEvent.press(saveBtn);
  });

  it.each(['manual', 'edit'] as const)('shows an error instead of saving a zero-metric %s activity', async (mode) => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockManualActivityMode = mode;
    mockManualActivityId = mode === 'edit' ? 'activity-id' : 'someId';
    mockManualActivityParams = {
      ...mockManualActivityParams,
      id: mockManualActivityId,
      mode,
    };

    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith('Нельзя сохранить активность, у которой нет дистанции и времени.'),
    );
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
  it('should correctly change global state after successfully sending activity', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(
      setFinishedActivity({
        ...createFinishedActivityDraft(),
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isSavingDisabled).toEqual(false);
    await userEvent.press(saveBtn);
  });

  it('queues a raw route only after its upload fails', async () => {
    const routeJournalId = createLocationJournal();
    const routeLocation = { ...MOCK_LOCATION, timestamp: MOCK_LOCATION.timestamp + 1 };
    let resolveRawRouteUpload!: (response: Response) => void;
    let hasStartedRawRouteUpload = false;
    const rawRouteUploadResponse = new Promise<Response>((resolve) => {
      resolveRawRouteUpload = resolve;
    });
    server.use(
      http.post(`${BASE_URL}/activity/someUserId`, () =>
        HttpResponse.json({ id: 'saved-activity-id' }, { status: 201 }),
      ),
      http.post(`${BASE_URL}/activity/saved-activity-id/locations/raw`, () => {
        hasStartedRawRouteUpload = true;
        return rawRouteUploadResponse;
      }),
    );
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(setFinishedActivity(createFinishedActivityDraft([routeLocation], routeJournalId)));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
    await act(async () => {
      jest.advanceTimersByTime(0);
      await Promise.resolve();
    });
    await waitFor(() => expect(hasStartedRawRouteUpload).toBe(true));
    expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(0);
    await act(async () => {
      resolveRawRouteUpload(HttpResponse.json({ message: 'Upload failed' }, { status: 503 }));
      await Promise.resolve();
    });
    await waitFor(() => expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(1));
    expect(readLocationJournal(routeJournalId)?.pointCount).toBe(1);
    removeLocationJournal(routeJournalId);
  });

  it('skips raw route upload when its journal disappears before the deferred request', async () => {
    const routeJournalId = createLocationJournal();
    let resolveActivitySave!: (response: Response) => void;
    let hasStartedActivitySave = false;
    const activitySaveResponse = new Promise<Response>((resolve) => {
      resolveActivitySave = resolve;
    });
    const uploadRawRoute = jest.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(
      http.post(`${BASE_URL}/activity/someUserId`, () => {
        hasStartedActivitySave = true;
        return activitySaveResponse;
      }),
      http.post(`${BASE_URL}/activity/saved-activity-id/locations/raw`, uploadRawRoute),
    );
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(setFinishedActivity(createFinishedActivityDraft([MOCK_LOCATION], routeJournalId)));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() => expect(hasStartedActivitySave).toBe(true));
    removeLocationJournal(routeJournalId);
    await act(async () => {
      resolveActivitySave(HttpResponse.json({ id: 'saved-activity-id' }, { status: 201 }));
      await Promise.resolve();
    });
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
    await act(async () => {
      jest.advanceTimersByTime(0);
      await Promise.resolve();
    });

    expect(uploadRawRoute).not.toHaveBeenCalled();
    expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(0);
  });

  it('returns to the previous screen after saving a manual activity', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockManualActivityMode = 'manual';
    mockManualActivityParams = {
      ...mockManualActivityParams,
      manualDistance: '5',
      manualHours: '1',
      manualMinutes: '20',
      mode: mockManualActivityMode,
    };
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.russian.save)).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it('returns to the feed after saving a tracked activity', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockManualActivityMode = 'tracked';
    mockStore.dispatch(
      setFinishedActivity({
        ...createFinishedActivityDraft(),
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.russian.save)).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
  });

  it('sends the recorded steps in a tracked activity payload', async () => {
    let requestBody: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE_URL}/activity/someUserId`, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'activity-id' });
      }),
    );
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(
      setFinishedActivity({
        ...createFinishedActivityDraft(),
        steps: 1_234,
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });

    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() => expect(requestBody?.steps).toBe(1_234));
  });

  it('caps tracked locations at the client limit before sending', async () => {
    let requestBody: Record<string, unknown> | undefined;
    server.use(
      http.post(`${BASE_URL}/activity/someUserId`, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'activity-id' });
      }),
    );
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(
      setFinishedActivity({
        ...createFinishedActivityDraft(
          Array.from({ length: MAX_SAVED_ROUTE_LOCATIONS + 1 }, (_, index) => ({
            ...MOCK_LOCATION,
            timestamp: MOCK_LOCATION.timestamp + index,
          })),
        ),
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });

    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() => expect((requestBody?.locations as unknown[])?.length).toBe(MAX_SAVED_ROUTE_LOCATIONS));
    await waitFor(() => expect(mockStore.getState().activity.isSavingDisabled).toBe(false));
  });

  it('saves the reduced activity first, then uploads the raw route after leaving the save screen', async () => {
    let activityBody: Record<string, unknown> | undefined;
    let rawRouteBody: Record<string, unknown> | undefined;
    const routeJournalId = createLocationJournal();
    const rawRoute = Array.from({ length: MAX_SAVED_ROUTE_LOCATIONS + 25 }, (_, index) => ({
      ...MOCK_LOCATION,
      timestamp: MOCK_LOCATION.timestamp + index + 1,
    }));
    server.use(
      http.post(`${BASE_URL}/activity/someUserId`, async ({ request }) => {
        activityBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'saved-activity-id' }, { status: 201 });
      }),
      http.post(`${BASE_URL}/activity/saved-activity-id/locations/raw`, async ({ request }) => {
        rawRouteBody = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    mockStore.dispatch(setMockUserId('someUserId'));
    mockStore.dispatch(setFinishedActivity(createFinishedActivityDraft(rawRoute, routeJournalId)));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });

    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
    expect((activityBody?.locations as unknown[]) ?? []).toHaveLength(MAX_SAVED_ROUTE_LOCATIONS);

    await act(async () => {
      jest.advanceTimersByTime(0);
      await Promise.resolve();
    });
    await waitFor(() => expect((rawRouteBody?.locations as unknown[]) ?? []).toHaveLength(rawRoute.length));
    await waitFor(() => expect(mockStore.getState().activity.pendingRawRouteUploads).toHaveLength(0));
    expect(readLocationJournal(routeJournalId)).toBeNull();
  });

  it.each([
    ['network failure', 'FETCH_ERROR'],
    ['502 gateway failure', 502],
    ['503 service failure', 503],
  ] as const)('queues a tracked activity after a %s', async (_label, status) => {
    mockStore.dispatch(setMockUserId('someWrongUserId'));
    mockManualActivityMode = 'tracked';
    mockStore.dispatch(
      setFinishedActivity({
        ...createFinishedActivityDraft(),
      }),
    );
    server.use(
      http.post(`${BASE_URL}/activity/someWrongUserId`, () =>
        status === 'FETCH_ERROR'
          ? HttpResponse.error()
          : HttpResponse.json({ message: 'Service unavailable' }, { status }),
      ),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(1));
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.root);
    expect(errorToast).not.toHaveBeenCalled();
  });

  it.each([400, 500])('shows an error and does not queue an activity after HTTP %s', async (status) => {
    mockStore.dispatch(setMockUserId('someUserId'));
    mockManualActivityMode = 'manual';
    mockManualActivityParams = {
      ...mockManualActivityParams,
      manualDistance: '5',
      manualHours: '1',
      mode: mockManualActivityMode,
    };
    server.use(
      http.post(`${BASE_URL}/activity/someUserId`, () =>
        HttpResponse.json({ message: 'Activity rejected' }, { status }),
      ),
    );

    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith('', expect.objectContaining({ status })));
    expect(mockStore.getState().activity.unsyncedActivities).toHaveLength(0);
    expect(mockReplace).not.toHaveBeenCalledWith(ROUTES.root);
  });

  it('returns to the activity after successfully editing it', async () => {
    let requestBody: Record<string, unknown> | undefined;
    server.use(
      http.patch(`${BASE_URL}/activity/activity-id`, async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'activity-id' });
      }),
    );
    mockStore.dispatch(setMockUserId('someUserId'));
    mockManualActivityMode = 'edit';
    mockManualActivityId = 'activity-id';
    mockManualActivityParams = {
      ...mockManualActivityParams,
      id: mockManualActivityId,
      manualDistance: '5',
      manualHours: '1',
      manualMinutes: '20',
      manualSeconds: '7',
      mode: mockManualActivityMode,
    };
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_SAVE_BTN.english.update)).toBeOnTheScreen();
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => {
      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(requestBody).toEqual(
        expect.objectContaining({
          distance: 5000,
          duration: 4_807_000,
        }),
      );
    });
  });

  it('disables saving while media is being compressed or uploaded', async () => {
    mockStore.dispatch(startMediaUpload());
    mockStore.dispatch(startMediaUpload());
    mockStore.dispatch(finishMediaUpload());
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });

    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(saveBtn).toBeDisabled();
    await userEvent.press(saveBtn);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
