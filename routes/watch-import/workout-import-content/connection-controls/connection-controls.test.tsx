import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { WORKOUT_IMPORT_COPY } from '../../workout-import/const';
import ConnectionControls from './connection-controls';

describe('ConnectionControls', () => {
  it('lets the user connect when the health store is not connected', async () => {
    const connect = jest.fn(async () => undefined);

    await renderWithProviders(
      <ConnectionControls
        autoSyncEnabled={false}
        connect={connect}
        copy={WORKOUT_IMPORT_COPY.en}
        isAutoSyncing={false}
        isConnected={false}
        isIOS={false}
        isLoading={false}
        isReading={false}
        setAutoSyncEnabled={jest.fn(async () => undefined)}
        syncLatestWorkouts={jest.fn(async () => undefined)}
      />,
    );

    await fireEvent.press(screen.getByTestId('health-connect-connect'));

    expect(screen.getByText(WORKOUT_IMPORT_COPY.en.connect)).toBeOnTheScreen();
    expect(connect).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('health-connect-refresh')).toBeNull();
  });

  it('lets the user change auto-sync, request iOS permissions, and refresh workouts', async () => {
    const connect = jest.fn(async () => undefined);
    const setAutoSyncEnabled = jest.fn(async () => undefined);
    const syncLatestWorkouts = jest.fn(async () => undefined);

    await renderWithProviders(
      <ConnectionControls
        autoSyncEnabled
        connect={connect}
        copy={WORKOUT_IMPORT_COPY.en}
        isAutoSyncing={false}
        isConnected
        isIOS
        isLoading={false}
        isReading={false}
        setAutoSyncEnabled={setAutoSyncEnabled}
        syncLatestWorkouts={syncLatestWorkouts}
      />,
    );

    await fireEvent(screen.getByTestId('health-connect-auto-sync-switch'), 'valueChange', false);
    await fireEvent.press(screen.getByTestId('health-connect-request-permissions'));
    await fireEvent.press(screen.getByTestId('health-connect-refresh'));

    expect(setAutoSyncEnabled).toHaveBeenCalledWith(false);
    expect(connect).toHaveBeenCalledTimes(1);
    expect(syncLatestWorkouts).toHaveBeenCalledWith(true);
    expect(screen.getByText(WORKOUT_IMPORT_COPY.en.iosConnected)).toBeOnTheScreen();
  });
});
