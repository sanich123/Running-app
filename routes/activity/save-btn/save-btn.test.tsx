import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ACTIVITY_SAVE_BTN, ACTIVITY_SAVE_BTN_TEST_ID } from '@const/activity-save-btn';
import { LANGUAGES, ROUTES } from '@const/enums';
import { setFinishedActivity } from '@R/slices/activity/activity';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_LOCATION, MOCK_DURATION, MOCK_SPEED, MOCK_DISTANCE } from '@T/mocks/mock-location';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { appendLocationToJournal, createLocationJournal } from '@U/location/location-journal';
import ActivitySaveBtn from './save-btn';

function createFinishedActivityDraft(routeLocations = [MOCK_LOCATION]) {
  const routeJournalId = createLocationJournal();
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
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => mockManualActivityParams,
  useGlobalSearchParams: () => mockManualActivityParams,
}));

describe('Activity save btn', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
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
  it('should correctly change global state', async () => {
    mockStore.dispatch(setMockUserId('someUserId'));
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    const saveBtn = screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID);
    expect(mockStore.getState().activity.isSavingDisabled).toEqual(false);
    await userEvent.press(saveBtn);
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

  it('returns to the feed after an unsent tracked activity fails to save', async () => {
    mockStore.dispatch(setMockUserId('someWrongUserId'));
    mockManualActivityMode = 'tracked';
    mockStore.dispatch(
      setFinishedActivity({
        ...createFinishedActivityDraft(),
      }),
    );
    await renderWithProviders(<ActivitySaveBtn />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_SAVE_BTN_TEST_ID));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(ROUTES.root));
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
});
