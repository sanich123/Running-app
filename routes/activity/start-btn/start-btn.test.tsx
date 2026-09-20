import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES, ROUTES, STATUSES } from '@const/enums';
import { resetFinishedActivity } from '@R/slices/activity/activity';
import { setActivityStatus, setDistance, setLocationsFromBackground, setDurationAt } from '@R/slices/location/location';
import { changeLanguage } from '@R/slices/settings/settings';
import { clearTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import * as errorToastModule from '@S/error-toast/error-toast';
import { MOCK_DURATION, MOCK_DISTANCE, MOCK_LOCATION } from '@T/mocks/mock-location';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import * as initialPosition from '@U/get-initial-position';
import * as backgroundLocation from '@U/location/expo-task-manager/background-location';
import * as pedometer from '@U/pedometer/pedometer';
import { ACTIVITY_START_BTN, ACTIVITY_START_BTN_TEST_ID } from './const';
import ActivityStartBtn from './start-btn';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useLocalSearchParams: () => ({ sport: 'run' }),
}));
describe('Activity start btn', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockLocation());
    mockStore.dispatch(resetFinishedActivity());
    mockStore.dispatch(clearTrackingRecovery());
    jest.restoreAllMocks();
  });

  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_START_BTN.english.start)).toBeOnTheScreen();
  });

  it('should correctly change from initial to started status', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByText(ACTIVITY_START_BTN.english.start);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.started);
  });
  it('should correctly change from started to paused status', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.paused);
  });

  it('should correctly change from paused to initial status', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.activityStatus).toEqual(STATUSES.initial);
  });

  it('opens manual activity after finishing the recording', async () => {
    mockPush.mockClear();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    await userEvent.press(screen.getByTestId(ACTIVITY_START_BTN_TEST_ID));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: `/${ROUTES.manualActivity}`,
      params: {
        cameraVisible: 'false',
        description: '',
        emotion: 'normal',
        visibility: 'followers',
        mode: 'tracked',
        sport: 'run',
        title: '',
      },
    });
  });

  it('keeps the accumulated steps when the activity is finished after a pause', async () => {
    const pedometerData = {
      steps: 1_234,
      samples: [
        { timestamp: 1_000, steps: 0 },
        { timestamp: 2_000, steps: 1_234 },
      ],
    };
    jest.spyOn(pedometer, 'pausePedometerActivity').mockResolvedValue(pedometerData);
    jest.spyOn(pedometer, 'finishPedometerActivity').mockResolvedValue(pedometerData);
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />);

    const startBtn = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);
    await userEvent.press(startBtn);
    expect(mockStore.getState().activity.finishedActivity.steps).toBe(1_234);

    await userEvent.press(startBtn);
    expect(mockStore.getState().activity.finishedActivity.steps).toBe(1_234);
  });

  it('cleans the previous recording before starting a new one', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setDurationAt(MOCK_DURATION));
    mockStore.dispatch(setDistance(MOCK_DISTANCE));
    mockStore.dispatch(setLocationsFromBackground(MOCK_LOCATION));
    mockStore.dispatch(setActivityStatus(STATUSES.initial));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />, { store: mockStore });
    const startBtn = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);
    await userEvent.press(startBtn);
    expect(mockStore.getState().location.distance).toEqual(0);
    expect(mockStore.getState().location.duration).toEqual(0);
    expect(mockStore.getState().location.locationsFromBackground).toEqual([]);
    expect(mockStore.getState().location.kilometresSplit).toEqual([]);
    expect(mockStore.getState().activity.finishedActivity.distance).toEqual(0);
    expect(mockStore.getState().activity.finishedActivity.routeJournalId).toBeNull();
  });
  it('should correctly renders finish in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation={false} />, { store: mockStore });
  });
  it('should correctly renders start in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockStore.dispatch(setActivityStatus(STATUSES.initial));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation={false} />, { store: mockStore });
    expect(screen.getByText(ACTIVITY_START_BTN.russian.start)).toBeOnTheScreen();
  });
  it('should correctly renders stop icon', async () => {
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation={false} />, { store: mockStore });
    expect(screen.getByTestId(new RegExp(`${ACTIVITY_START_BTN_TEST_ID}`))).toBeOnTheScreen();
  });

  it('locks and shows a loader while getting the initial location', async () => {
    let resolvePosition!: (position: typeof MOCK_LOCATION) => void;
    const positionPromise = new Promise<typeof MOCK_LOCATION>((resolve) => {
      resolvePosition = resolve;
    });
    const positionSpy = jest.spyOn(initialPosition, 'getCurrentOrLastKnownPosition').mockReturnValue(positionPromise);
    const startSpy = jest.spyOn(backgroundLocation, 'startLocationTracking').mockResolvedValue();

    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation isGettingLocation={false} />);
    const startButton = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);

    await userEvent.press(startButton);
    await waitFor(() => expect(screen.getByTestId('location-loading')).toBeOnTheScreen());
    expect(startButton).toBeDisabled();
    expect(startSpy).not.toHaveBeenCalled();

    resolvePosition(MOCK_LOCATION);
    await waitFor(() => expect(mockStore.getState().location.activityStatus).toBe(STATUSES.started));
    expect(positionSpy).toHaveBeenCalledTimes(1);
    expect(mockStore.getState().location.initialLocation).toBe(MOCK_LOCATION);
  });

  it('locks the button while starting and changes status only after success', async () => {
    let resolveStart!: () => void;
    const startPromise = new Promise<void>((resolve) => {
      resolveStart = resolve;
    });
    const startSpy = jest.spyOn(backgroundLocation, 'startLocationTracking').mockReturnValue(startPromise);
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />);
    const startButton = screen.getByTestId(ACTIVITY_START_BTN_TEST_ID);

    await userEvent.press(startButton);
    await waitFor(() => expect(screen.getByTestId('location-loading')).toBeOnTheScreen());
    await userEvent.press(startButton);
    expect(startSpy).toHaveBeenCalledTimes(1);

    resolveStart();
    await waitFor(() => expect(mockStore.getState().location.activityStatus).toBe(STATUSES.started));
  });

  it('reports a start error and leaves the activity in initial status', async () => {
    const error = new Error('start failed');
    jest.spyOn(backgroundLocation, 'startLocationTracking').mockRejectedValue(error);
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    await renderWithProviders(<ActivityStartBtn isReadyToRecordLocation />);
    await userEvent.press(screen.getByTestId(ACTIVITY_START_BTN_TEST_ID));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith('Не удалось запустить отслеживание геопозиции', error));
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.initial);
  });
});
