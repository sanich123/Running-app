import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { STATUSES } from '@const/enums';
import { addDurationAndLocationToKmSplits, setActivityStatus } from '@R/slices/location/location';
import * as errorToastModule from '@S/error-toast/error-toast';
import { MOCK_LOCATION } from '@T/mocks/mock-location';
import { mockStore, resetMockLocation } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import * as backgroundLocation from '@U/location/expo-task-manager/background-location';
import PauseBtn from './pause-btn';

let mockOnPress: (() => Promise<void>) | undefined;

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const { Pressable } = jest.requireActual('react-native');
  return {
    ...actual,
    TouchableRipple: ({ children, ...props }: Record<string, any>) => {
      mockOnPress = props.onPress;
      return <Pressable {...props}>{children}</Pressable>;
    },
  };
});

describe('pause btn', () => {
  beforeEach(() => {
    mockStore.dispatch(resetMockLocation());
    jest.restoreAllMocks();
  });

  it('pauses and resumes activity recording', async () => {
    const user = userEvent.setup();
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<PauseBtn />);
    await user.press(screen.getByTestId('activity-pause-toggle'));
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.paused);
    await user.press(screen.getByTestId('activity-pause-toggle'));
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.continued);
  });

  it('does not dispatch a pause until stopping tracking succeeds', async () => {
    let resolveStop!: () => void;
    const stopPromise = new Promise<void>((resolve) => {
      resolveStop = resolve;
    });
    const stopSpy = jest.spyOn(backgroundLocation, 'stopLocationTracking').mockReturnValue(stopPromise);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<PauseBtn />);
    const pauseButton = screen.getByTestId('activity-pause-toggle');

    await userEvent.press(pauseButton);
    await waitFor(() => expect(screen.getByTestId('pause-tracking-action-loading')).toBeOnTheScreen());
    await userEvent.press(pauseButton);
    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.started);

    resolveStop();
    await waitFor(() => expect(mockStore.getState().location.activityStatus).toBe(STATUSES.paused));
  });

  it('reports a stop error without changing the activity status', async () => {
    const error = new Error('stop failed');
    jest.spyOn(backgroundLocation, 'stopLocationTracking').mockRejectedValue(error);
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<PauseBtn />);
    await userEvent.press(screen.getByTestId('activity-pause-toggle'));

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith('Не удалось остановить отслеживание геопозиции', error),
    );
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.started);
  });

  it('reports a resume error without changing the activity status', async () => {
    const error = new Error('start failed');
    jest.spyOn(backgroundLocation, 'startLocationTracking').mockRejectedValue(error);
    const errorToast = jest.spyOn(errorToastModule, 'errorToast').mockImplementation(() => undefined);
    mockStore.dispatch(setActivityStatus(STATUSES.paused));
    await renderWithProviders(<PauseBtn />);
    await userEvent.press(screen.getByTestId('activity-pause-toggle'));

    await waitFor(() => expect(errorToast).toHaveBeenCalledWith('Не удалось запустить отслеживание геопозиции', error));
    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.paused);
  });

  it('ignores a second tracking action while the first one is pending', async () => {
    let resolveStop!: () => void;
    const stopPromise = new Promise<void>((resolve) => {
      resolveStop = resolve;
    });
    jest.spyOn(backgroundLocation, 'stopLocationTracking').mockReturnValue(stopPromise);
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<PauseBtn />);

    let firstPress!: Promise<void>;
    await act(async () => {
      firstPress = mockOnPress!();
    });
    await waitFor(() => expect(screen.getByTestId('pause-tracking-action-loading')).toBeOnTheScreen());
    await act(async () => {
      await mockOnPress!();
    });
    resolveStop();
    await act(async () => {
      await firstPress;
    });

    expect(mockStore.getState().location.activityStatus).toBe(STATUSES.paused);
  });

  it('preserves the split altitude when no calculated elevation is available', async () => {
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    mockStore.dispatch(addDurationAndLocationToKmSplits(MOCK_LOCATION));
    await renderWithProviders(<PauseBtn />);
    await userEvent.press(screen.getByTestId('activity-pause-toggle'));

    await waitFor(() => expect(mockStore.getState().location.activityStatus).toBe(STATUSES.paused));
    expect(mockStore.getState().activity.finishedActivity?.kilometresSplit).toEqual([
      expect.objectContaining({ lastKilometerAltitude: 0 }),
    ]);
  });
});
