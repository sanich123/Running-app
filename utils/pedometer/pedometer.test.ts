import { Pedometer } from 'expo-sensors';
import { getStepsForKilometreSplits, type PedometerActivityData } from './pedometer';

describe('pedometer activity metrics', () => {
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

  it('keeps the pedometer module import available for native permission integration', () => {
    expect(Pedometer).toBeDefined();
  });
});
