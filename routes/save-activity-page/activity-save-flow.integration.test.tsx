import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { ACTIVITY_SAVE_BTN_TEST_ID } from '@const/activity-save-btn';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { runichApi } from '@R/runich-api/runich-api';
import { resetFinishedActivity, addPhotoUrl, resetActivityDraft } from '@R/slices/activity/activity';
import { setUserId, resetAuthSlice } from '@R/slices/auth/auth';
import { resetLocationSlice, setDistance, setDuration, setLocationsFromBackground } from '@R/slices/location/location';
import ActivitySaveBtn from '@Routes/activity/save-btn/save-btn';
import StartBtn from '@Routes/activity/start-btn/start-btn';
import UpdateBtn from '@S/users-settings-icons/activity-update-btn/update-btn';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { MOCK_SERVER_ACTIVITY, MOCK_SERVER_IDS } from '@T/responses/runich';
import { BASE_URL } from '@T/utils/handlers';
import { mockStore } from '@T/utils/mock-store';
import { server } from '@T/utils/server';
import { renderWithProviders } from '@T/utils/test-utils';
import * as backgroundLocation from '@U/location/expo-task-manager/background-location';
import { getMapBoxImage, getReducedLocations, getSpeedInMinsInKm } from '@U/location/location-utils';
import { getMillisecondsFromHoursMinutesSeconds } from '@U/time-formatter';
import { CHECKBOX_TEST_ID } from './checkbox/const';
import { DATE_TIME_PICKER_BTN_ID } from './date-picker/const';
import { EMOTIONS_BTNS_TEST_IDS, EMOTIONS_BTNS_VALUES } from './emotion-btns/const';
import { INPUT_DISTANCE_ID, INPUT_HOURS_ID, INPUT_MINUTES_ID, INPUT_SECONDS_ID } from './inputs-distance-time/const';
import SaveResult from './save-activity-page';
import { TEXT_INPUTS_DESCRIPTION_TEST_ID, TEXT_INPUTS_TITLE_TEST_ID } from './text-inputs/const';

const mockUserId = 'activity-flow-user';
const mockActivityPhoto = { url: 'https://images.example.test/manual.jpg', thumbnail: null };
const mockStartLocationTracking = jest.spyOn(backgroundLocation, 'startLocationTracking').mockResolvedValue();
const mockStopLocationTracking = jest.spyOn(backgroundLocation, 'stopLocationTracking').mockResolvedValue();

type RouteParams = Record<string, string>;

jest.mock('expo-router', () => {
  const routeParams: Record<string, string> = {};
  const back = jest.fn();
  const replace = jest.fn();
  const push = jest.fn((route: { params?: Record<string, string> }) => {
    if (route.params) {
      Object.assign(routeParams, route.params);
    }
  });

  return {
    useLocalSearchParams: () => routeParams,
    useGlobalSearchParams: () => routeParams,
    usePathname: () => `/activity/${routeParams.id ?? 'bad3520c-c795-439c-ae9b-474625b4b200'}`,
    useRouter: () => ({
      back,
      replace,
      push,
      setParams: (params: Record<string, string>) => Object.assign(routeParams, params),
    }),
    router: { replace },
    __getRouteParams: () => routeParams,
    __setRouteParams: (params: Record<string, string>) => {
      Object.keys(routeParams).forEach((key) => delete routeParams[key]);
      Object.assign(routeParams, params);
    },
    __back: back,
    __replace: replace,
    __push: push,
  };
});

const mockExpoRouter = jest.requireMock('expo-router') as {
  __getRouteParams: () => RouteParams;
  __setRouteParams: (params: RouteParams) => void;
  __back: jest.Mock;
  __replace: jest.Mock;
  __push: jest.Mock;
};
const mockRouteParams = mockExpoRouter.__getRouteParams();
const mockBack = mockExpoRouter.__back;
const mockReplace = mockExpoRouter.__replace;
const mockPush = mockExpoRouter.__push;

function setMockRouteParams(params: RouteParams) {
  mockExpoRouter.__setRouteParams(params);
}

jest.mock('react-native-date-picker', () => {
  const { View } = jest.requireActual('react-native');
  return (props: Record<string, unknown>) => <View testID="integration-date-picker" {...props} />;
});

jest.mock('@S/choose-sport-modal/choose-sport-modal', () => {
  const { TouchableOpacity } = jest.requireActual('react-native');
  return ({ onSportChange }: { onSportChange: (sport: string) => void }) => (
    <TouchableOpacity testID="integration-sport-bike" onPress={() => onSportChange('bike')} />
  );
});

function ActivityEditorHarness() {
  return (
    <>
      <SaveResult />
      <ActivitySaveBtn />
    </>
  );
}

function TrackedActivityHarness() {
  return (
    <>
      <StartBtn isReadyToRecordLocation isGettingLocation={false} />
      {mockRouteParams.mode === 'tracked' && (
        <>
          <SaveResult />
          <ActivitySaveBtn />
        </>
      )}
    </>
  );
}

function EditActivityHarness() {
  return (
    <>
      <UpdateBtn />
      <SaveResult />
      <ActivitySaveBtn />
    </>
  );
}

function resetActivityFlowState() {
  mockStore.dispatch(resetAuthSlice());
  mockStore.dispatch(resetFinishedActivity());
  mockStore.dispatch(resetActivityDraft());
  mockStore.dispatch(resetLocationSlice());
  mockStore.dispatch(runichApi.util.resetApiState());
}

async function fillActivityFields(includeManualFields: boolean) {
  await fireEvent.changeText(screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID), 'Morning activity');
  await fireEvent.changeText(screen.getByTestId(TEXT_INPUTS_DESCRIPTION_TEST_ID), 'Felt strong and consistent');

  await fireEvent.press(screen.getByTestId('manual-activity-sport-picker'));
  await fireEvent.press(screen.getByTestId('integration-sport-bike'));
  await fireEvent.press(screen.getByTestId(EMOTIONS_BTNS_TEST_IDS.goodInput));
  await fireEvent(screen.getByTestId(CHECKBOX_TEST_ID), 'valueChange', false);

  if (includeManualFields) {
    await fireEvent.changeText(screen.getByTestId(INPUT_DISTANCE_ID), '12.5');
    await fireEvent.changeText(screen.getByTestId(INPUT_HOURS_ID), '1');
    await fireEvent.changeText(screen.getByTestId(INPUT_MINUTES_ID), '35');
    await fireEvent.changeText(screen.getByTestId(INPUT_SECONDS_ID), '12');

    const selectedDate = new Date('2026-08-18T12:30:00.000Z');
    await fireEvent.press(screen.getByTestId(DATE_TIME_PICKER_BTN_ID));
    await act(async () => screen.getByTestId('integration-date-picker').props.onConfirm(selectedDate));
  }
}

async function pressAsync(testId: string) {
  const element = screen.getByTestId(testId);
  if (testId === 'startButton') {
    await userEvent.press(element);
    return;
  }

  const pressabilityConfig = element.props.onStartShouldSetResponder?.testOnly_pressabilityConfig?.();
  const onPress = pressabilityConfig?.onPress ?? element.props.onPress;

  if (!onPress) {
    throw new Error(`No press handler found for ${testId}`);
  }

  await act(async () => onPress());
}

describe('activity save flows', () => {
  beforeEach(() => {
    resetActivityFlowState();
    setMockRouteParams({});
    mockBack.mockClear();
    mockReplace.mockClear();
    mockPush.mockClear();
    mockStartLocationTracking.mockClear();
    mockStopLocationTracking.mockClear();
  });

  it('creates a manual activity with every editor field in the POST payload', async () => {
    let requestBody: unknown;
    server.use(
      http.post(`${BASE_URL}/activity/${mockUserId}`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: 'manual-activity-id' }, { status: 201 });
      }),
    );

    mockStore.dispatch(setUserId(mockUserId));
    mockStore.dispatch(addPhotoUrl(mockActivityPhoto));
    setMockRouteParams({
      cameraVisible: 'false',
      description: '',
      emotion: EMOTIONS_BTNS_VALUES.normal,
      isPublic: 'true',
      manualDate: '2026-08-17T10:00:00.000Z',
      manualDistance: '0',
      manualHours: '0',
      manualMinutes: '0',
      manualSeconds: '0',
      mode: 'manual',
      sport: SPORTS_BTNS_VALUES.run,
      title: '',
    });

    const view = await renderWithProviders(<ActivityEditorHarness />);
    await fillActivityFields(true);
    await view.rerender(<ActivityEditorHarness key="filled" />);
    await waitFor(() => expect(screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID).props.value).toBe('Morning activity'));
    await pressAsync(ACTIVITY_SAVE_BTN_TEST_ID);

    const duration = getMillisecondsFromHoursMinutesSeconds(1, 35, 12);
    await waitFor(() => {
      expect(requestBody).toEqual({
        title: 'Morning activity',
        description: 'Felt strong and consistent',
        sport: SPORTS_BTNS_VALUES.bike,
        emotion: EMOTIONS_BTNS_VALUES.good,
        isPublic: false,
        photoVideoUrls: [mockActivityPhoto],
        date: '2026-08-18T12:30:00.000Z',
        distance: 12_500,
        duration,
        speed: getSpeedInMinsInKm(12.5, duration).paceAsNumber,
        locations: [],
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  it('saves a tracked activity after the complete tracking flow and editor completion', async () => {
    let activityRequestBody: unknown;
    let sessionLocationBody: unknown;
    server.use(
      http.post(`${BASE_URL}/activity/${mockUserId}`, async ({ request }) => {
        activityRequestBody = await request.json();
        return HttpResponse.json({ id: 'tracked-activity-id' }, { status: 201 });
      }),
      http.patch(`${BASE_URL}/auth/session/location`, async ({ request }) => {
        sessionLocationBody = await request.json();
        return HttpResponse.json({ updated: true });
      }),
    );

    mockStore.dispatch(setUserId(mockUserId));
    setMockRouteParams({
      cameraVisible: 'false',
      mode: 'recording',
      sport: SPORTS_BTNS_VALUES.run,
    });

    const view = await renderWithProviders(<TrackedActivityHarness />);

    await pressAsync('startButton');
    await waitFor(() => expect(mockStore.getState().location.activityStatus).toBe('started'));

    const trackedDuration = 90_007;
    const trackedDistance = 2_500;
    await act(async () => {
      mockStore.dispatch(setDuration(trackedDuration));
      mockStore.dispatch(setDistance(trackedDistance));
      mockStore.dispatch(setLocationsFromBackground(MOCK_LOCATION));
    });

    await pressAsync('startButton');
    await waitFor(() => expect(mockStore.getState().location.activityStatus).toBe('paused'));

    await pressAsync('startButton');
    await waitFor(() => expect(mockRouteParams.mode).toBe('tracked'));
    await view.rerender(<TrackedActivityHarness key="tracked" />);

    await act(async () => mockStore.dispatch(addPhotoUrl(mockActivityPhoto)));
    await fillActivityFields(false);
    expect(mockRouteParams.title).toBe('Morning activity');
    await view.rerender(<TrackedActivityHarness key="filled" />);
    await waitFor(() => expect(screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID).props.value).toBe('Morning activity'));
    await pressAsync(ACTIVITY_SAVE_BTN_TEST_ID);

    const trackedLocations = getReducedLocations([MOCK_LOCATION]);
    await waitFor(() => {
      expect(activityRequestBody).toEqual({
        locations: trackedLocations,
        duration: trackedDuration,
        speed: getSpeedInMinsInKm(trackedDistance, trackedDuration).paceAsNumber,
        distance: trackedDistance,
        kilometresSplit: [],
        title: 'Morning activity',
        description: 'Felt strong and consistent',
        sport: SPORTS_BTNS_VALUES.bike,
        emotion: EMOTIONS_BTNS_VALUES.good,
        isPublic: false,
        photoVideoUrls: [mockActivityPhoto],
        mapPhotoUrl: getMapBoxImage(trackedLocations),
      });
      expect(sessionLocationBody).toEqual({
        latitude: MOCK_LOCATION.coords.latitude,
        longitude: MOCK_LOCATION.coords.longitude,
      });
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('loads an existing activity, edits every field and sends the complete PATCH payload', async () => {
    let requestBody: unknown;
    server.use(
      http.patch(`${BASE_URL}/activity/${MOCK_SERVER_IDS.activityId}`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ id: MOCK_SERVER_IDS.activityId });
      }),
    );

    mockStore.dispatch(setUserId(mockUserId));
    setMockRouteParams({
      cameraVisible: 'false',
      id: MOCK_SERVER_IDS.activityId,
      mode: 'recording',
    });

    const view = await renderWithProviders(<EditActivityHarness />);
    await waitFor(() =>
      expect(screen.getByTestId('activity-update-button').props.accessibilityState?.disabled).toBe(false),
    );
    await pressAsync('activity-update-button');
    await waitFor(() => expect(mockRouteParams.mode).toBe('edit'));
    await view.rerender(<EditActivityHarness key="loaded" />);
    expect(screen.getByTestId(TEXT_INPUTS_TITLE_TEST_ID).props.value).toBe(MOCK_SERVER_ACTIVITY.title);

    await fillActivityFields(true);
    await view.rerender(<EditActivityHarness key="filled" />);
    await pressAsync(ACTIVITY_SAVE_BTN_TEST_ID);

    const duration = getMillisecondsFromHoursMinutesSeconds(1, 35, 12);
    await waitFor(() => {
      expect(requestBody).toEqual({
        title: 'Morning activity',
        description: 'Felt strong and consistent',
        sport: SPORTS_BTNS_VALUES.bike,
        emotion: EMOTIONS_BTNS_VALUES.good,
        isPublic: false,
        photoVideoUrls: MOCK_SERVER_ACTIVITY.photoVideoUrls,
        date: '2026-08-18T12:30:00.000Z',
        distance: 12_500,
        duration,
        speed: getSpeedInMinsInKm(12.5, duration).paceAsNumber,
        locations: [],
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });
});
