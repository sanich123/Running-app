import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { STATUSES } from '@const/enums';
import { setActivityStatus } from '@R/slices/location/location';
import * as errorToastModule from '@S/error-toast/error-toast';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import * as backgroundLocation from '@U/location/expo-task-manager/background-location';
import PauseBtn from './pause-btn';

describe('pause btn', () => {
  beforeEach(() => {
    mockStore.dispatch(require('@R/slices/location/location').resetLocationSlice());
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
});
