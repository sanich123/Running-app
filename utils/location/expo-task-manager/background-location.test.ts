import * as ExpoLocation from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { resetLocationSlice, setLastPosition } from '@R/slices/location/location';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import { LOCATION_TRACKING } from '../const';
import { startLocationTracking, stopLocationTracking } from './background-location';
import { getMetricsTaskManager, saveMetricsToStoreTaskManager } from './utils';
import type { LocationObject } from 'expo-location';

jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));
jest.mock('expo-location', () => ({
  Accuracy: { BestForNavigation: 6 },
  hasStartedLocationUpdatesAsync: jest.fn(),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: jest.fn() }));
jest.mock('./utils', () => ({
  getMetricsTaskManager: jest.fn(),
  saveMetricsToStoreTaskManager: jest.fn(),
}));

const taskHandler = (TaskManager.defineTask as jest.Mock).mock.calls[0][1] as (event: unknown) => Promise<void>;
const location = { timestamp: 2_000, coords: { latitude: 55, longitude: 37 } } as LocationObject;

describe('background location tracking', () => {
  beforeEach(() => {
    store.dispatch(resetLocationSlice());
    jest.clearAllMocks();
    jest.spyOn(ExpoLocation, 'hasStartedLocationUpdatesAsync').mockResolvedValue(false);
    jest.spyOn(ExpoLocation, 'startLocationUpdatesAsync').mockResolvedValue(undefined);
    jest.spyOn(ExpoLocation, 'stopLocationUpdatesAsync').mockResolvedValue(undefined);
    (getMetricsTaskManager as jest.Mock).mockReturnValue({
      previousPosition: null,
      currentDuration: 1_000,
      currentDistance: 10,
      currentAltitude: 0,
      currentPace: 6,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts location updates only when the task is not already running', async () => {
    await startLocationTracking();
    expect(ExpoLocation.startLocationUpdatesAsync).toHaveBeenCalledWith(
      LOCATION_TRACKING,
      expect.objectContaining({ timeInterval: expect.any(Number), distanceInterval: expect.any(Number) }),
    );

    jest.clearAllMocks();
    (ExpoLocation.hasStartedLocationUpdatesAsync as jest.Mock).mockResolvedValue(true);
    await startLocationTracking();
    expect(ExpoLocation.startLocationUpdatesAsync).not.toHaveBeenCalled();
    await stopLocationTracking();
  });

  it('stops an active task and treats a missing native task as already stopped', async () => {
    (ExpoLocation.hasStartedLocationUpdatesAsync as jest.Mock).mockResolvedValue(true);
    await stopLocationTracking();
    expect(ExpoLocation.stopLocationUpdatesAsync).toHaveBeenCalledWith(LOCATION_TRACKING);

    (ExpoLocation.stopLocationUpdatesAsync as jest.Mock).mockRejectedValueOnce(new Error('TaskNotFoundException'));
    await expect(stopLocationTracking()).resolves.toBeUndefined();

    (ExpoLocation.stopLocationUpdatesAsync as jest.Mock).mockRejectedValueOnce(
      `Task '${LOCATION_TRACKING}' not found`,
    );
    await expect(stopLocationTracking()).resolves.toBeUndefined();
  });

  it('surfaces errors from a task that cannot be stopped', async () => {
    (ExpoLocation.hasStartedLocationUpdatesAsync as jest.Mock).mockResolvedValue(true);
    (ExpoLocation.stopLocationUpdatesAsync as jest.Mock).mockRejectedValue(new Error('native failure'));

    await expect(stopLocationTracking()).rejects.toThrow('native failure');
  });

  it('ignores task errors and empty location batches', async () => {
    await taskHandler({ error: new Error('permission revoked'), data: null });
    expect(errorToast).toHaveBeenCalledWith('Ошибка фонового отслеживания геопозиции', expect.any(Error));

    await taskHandler({ error: null, data: undefined });
    await taskHandler({ error: null, data: { locations: [] } });
    expect(getMetricsTaskManager).not.toHaveBeenCalled();
  });

  it('processes fresh locations only while tracking is active', async () => {
    await taskHandler({ error: null, data: { locations: [location] } });
    expect(getMetricsTaskManager).not.toHaveBeenCalled();

    await startLocationTracking();
    await taskHandler({ error: null, data: { locations: [location, { ...location, timestamp: 3_000 }] } });

    expect(getMetricsTaskManager).toHaveBeenCalledTimes(2);
    expect(saveMetricsToStoreTaskManager).toHaveBeenCalledTimes(2);
    await stopLocationTracking();
  });

  it('skips a point older than the last saved location and keeps processing errors local', async () => {
    await startLocationTracking();
    store.dispatch(setLastPosition({ ...location, timestamp: 5_000 }));
    await taskHandler({ error: null, data: { locations: [location] } });
    expect(getMetricsTaskManager).not.toHaveBeenCalled();

    store.dispatch(resetLocationSlice());
    (getMetricsTaskManager as jest.Mock).mockImplementation(() => {
      throw new Error('metric failure');
    });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await taskHandler({ error: null, data: { locations: [{ ...location, timestamp: 6_000 }] } });
    expect(saveMetricsToStoreTaskManager).not.toHaveBeenCalled();
    await stopLocationTracking();
  });
});
