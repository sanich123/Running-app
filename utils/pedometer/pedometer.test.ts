import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import {
  finishPedometerActivity,
  getPedometerActivityData,
  getStepsForKilometreSplits,
  pausePedometerActivity,
  resetPedometerActivity,
  resumePedometerActivity,
  startPedometerActivity,
  subscribePedometerSteps,
  type PedometerActivityData,
} from './pedometer';

type StepCallback = (result: { steps: number }) => void;
const originalPlatform = Platform.OS;

const setPlatform = (platform: 'android' | 'ios' | 'web') => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: platform });
};

describe('pedometer activity metrics', () => {
  beforeEach(() => {
    resetPedometerActivity();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('starts a native stream, notifies listeners and stores samples across a pause', async () => {
    setPlatform('android');
    let onStep: StepCallback | undefined;
    const remove = jest.fn();
    jest.spyOn(Pedometer, 'isAvailableAsync').mockResolvedValue(true);
    jest.spyOn(Pedometer, 'getPermissionsAsync').mockResolvedValue({ granted: true } as never);
    jest.spyOn(Pedometer, 'watchStepCount').mockImplementation((callback) => {
      onStep = callback;
      return { remove } as ReturnType<typeof Pedometer.watchStepCount>;
    });
    jest.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(2_000).mockReturnValueOnce(3_000);
    const listener = jest.fn();
    const unsubscribe = subscribePedometerSteps(listener);

    expect(await startPedometerActivity()).toBe(true);
    onStep?.({ steps: 12 });
    await pausePedometerActivity();

    expect(listener).toHaveBeenCalledWith(0);
    expect(listener).toHaveBeenCalledWith(12);
    expect(getPedometerActivityData()).toEqual({
      steps: 12,
      samples: [
        { timestamp: 1_000, steps: 0 },
        { timestamp: 2_000, steps: 12 },
        { timestamp: 3_000, steps: 12 },
      ],
    });
    expect(remove).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('requests permission when needed and resumes an existing activity without resetting steps', async () => {
    setPlatform('android');
    const remove = jest.fn();
    jest.spyOn(Pedometer, 'isAvailableAsync').mockResolvedValue(true);
    jest.spyOn(Pedometer, 'getPermissionsAsync').mockResolvedValue({ granted: false } as never);
    jest.spyOn(Pedometer, 'requestPermissionsAsync').mockResolvedValue({ granted: true } as never);
    jest.spyOn(Pedometer, 'watchStepCount').mockReturnValue({ remove } as ReturnType<typeof Pedometer.watchStepCount>);
    jest.spyOn(Date, 'now').mockReturnValue(1_000);

    expect(await startPedometerActivity()).toBe(true);
    expect(await resumePedometerActivity()).toBe(true);
    expect(Pedometer.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Pedometer.watchStepCount).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['web platform', 'web' as const],
    ['unavailable sensor', 'android' as const],
  ])('does not start when the %s cannot provide steps', async (_label, platform) => {
    setPlatform(platform);
    jest.spyOn(Pedometer, 'isAvailableAsync').mockResolvedValue(false);

    expect(await startPedometerActivity()).toBe(false);
    expect(Pedometer.watchStepCount).not.toHaveBeenCalled();
  });

  it('does not start after permission is denied or when the sensor throws', async () => {
    setPlatform('android');
    jest.spyOn(Pedometer, 'isAvailableAsync').mockResolvedValue(true);
    jest.spyOn(Pedometer, 'getPermissionsAsync').mockResolvedValue({ granted: false } as never);
    jest.spyOn(Pedometer, 'requestPermissionsAsync').mockResolvedValue({ granted: false } as never);

    expect(await startPedometerActivity()).toBe(false);

    jest.spyOn(Pedometer, 'isAvailableAsync').mockRejectedValue(new Error('sensor failure'));
    expect(await startPedometerActivity()).toBe(false);
  });

  it('uses the iOS date-range query and falls back to the observed total when it fails', async () => {
    setPlatform('ios');
    jest.spyOn(Pedometer, 'isAvailableAsync').mockResolvedValue(true);
    jest.spyOn(Pedometer, 'getPermissionsAsync').mockResolvedValue({ granted: true } as never);
    jest.spyOn(Pedometer, 'watchStepCount').mockReturnValue({ remove: jest.fn() } as ReturnType<typeof Pedometer.watchStepCount>);
    jest.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(2_000);
    jest.spyOn(Pedometer, 'getStepCountAsync').mockResolvedValue({ steps: 42 });

    await startPedometerActivity();
    const queriedData = await finishPedometerActivity();

    expect(queriedData.steps).toBe(42);
    expect(Pedometer.getStepCountAsync).toHaveBeenCalledWith(new Date(1_000), new Date(2_000));
    expect(getPedometerActivityData()).toEqual({ steps: 0, samples: [] });

    jest.spyOn(Pedometer, 'getStepCountAsync').mockRejectedValue(new Error('history unavailable'));
    jest.spyOn(Date, 'now').mockReturnValueOnce(3_000).mockReturnValueOnce(4_000);
    await startPedometerActivity();
    const fallbackData = await finishPedometerActivity();
    expect(fallbackData.steps).toBe(0);
  });

  it('assigns cumulative steps to kilometre splits using their timestamps', () => {
    const data: PedometerActivityData = {
      steps: 300,
      samples: [
        { timestamp: 0, steps: 0 },
        { timestamp: 60_000, steps: 100 },
        { timestamp: 120_000, steps: 300 },
      ],
    };
    const splits = [
      {
        lastKilometerDuration: 60_000,
        lastKilometerAltitude: 0,
        kilometerPoint: { timestamp: 60_000, coords: { latitude: 55, longitude: 37 } },
      },
      {
        lastKilometerDuration: 60_000,
        lastKilometerAltitude: 0,
        kilometerPoint: { timestamp: 120_000, coords: { latitude: 55, longitude: 37 } },
      },
    ];

    expect(getStepsForKilometreSplits(splits, data)).toEqual([100, 200]);
  });

  it('interpolates, clamps and ignores invalid split timestamps', () => {
    const data: PedometerActivityData = {
      steps: 50,
      samples: [
        { timestamp: 1_000, steps: 10 },
        { timestamp: 2_000, steps: 30 },
        { timestamp: 3_000, steps: 50 },
      ],
    };

    expect(
      getStepsForKilometreSplits(
        [
          { lastKilometerDuration: 0, lastKilometerAltitude: 0, kilometerPoint: { timestamp: 500, coords: {} } as never },
          { lastKilometerDuration: 0, lastKilometerAltitude: 0, kilometerPoint: { timestamp: 1_500, coords: {} } as never },
          { lastKilometerDuration: 0, lastKilometerAltitude: 0, kilometerPoint: { coords: { timestamp: 2_500 } } as never },
          {
            lastKilometerDuration: 0,
            lastKilometerAltitude: 0,
            kilometerPoint: { timestamp: Number.NaN, coords: { timestamp: 2_500 } } as never,
          },
          { lastKilometerDuration: 0, lastKilometerAltitude: 0, kilometerPoint: { timestamp: 4_000, coords: {} } as never },
        ],
        data,
      ),
    ).toEqual([0, 10, 20, 0, 10]);
    expect(getStepsForKilometreSplits([], { steps: 0, samples: [] })).toEqual([]);
  });

  it('keeps the pedometer module import available for native permission integration', () => {
    expect(Pedometer).toBeDefined();
  });
});
