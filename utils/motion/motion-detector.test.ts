import { createMotionStatusDetector } from './motion-detector';

const stillAcceleration = { x: 0, y: 0, z: 1 };
const movingAcceleration = { x: 0.3, y: 0, z: 1.1 };
const clearlyMovingAcceleration = { x: 1, y: 0, z: 1 };

function getInput(timestamp: number, overrides: Partial<Parameters<ReturnType<typeof createMotionStatusDetector>['update']>[0]> = {}) {
  return {
    timestamp,
    acceleration: stillAcceleration,
    location: {
      timestamp,
      coords: { latitude: 55, longitude: 37, speed: 0 },
    } as Parameters<ReturnType<typeof createMotionStatusDetector>['update']>[0]['location'],
    pedometerSteps: 0,
    pedometerAvailable: true,
    ...overrides,
  };
}

describe('motion status detector', () => {
  it('requires sustained stillness from several signals before reporting rest', () => {
    const detector = createMotionStatusDetector();

    expect(detector.update(getInput(0)).status).toBe('moving');
    expect(detector.update(getInput(1_000)).status).toBe('moving');
    expect(detector.update(getInput(2_000)).status).toBe('moving');
    expect(detector.update(getInput(31_000)).status).toBe('moving');
    const result = detector.update(getInput(32_000));

    expect(result.status).toBe('resting');
    expect(result.restingSources).toEqual(['accelerometer', 'gps', 'pedometer']);
  });

  it('returns to moving after confirmed steps', () => {
    const detector = createMotionStatusDetector();

    detector.update(getInput(0));
    detector.update(getInput(1_000));
    detector.update(getInput(2_000));
    detector.update(getInput(31_000));
    expect(detector.update(getInput(32_000)).status).toBe('resting');
    expect(detector.update(getInput(32_000, { pedometerSteps: 1 })).status).toBe('resting');
    const result = detector.update(getInput(35_000, { pedometerSteps: 2 }));

    expect(result.status).toBe('moving');
    expect(result.restingSources).toEqual([]);
  });

  it('reports rest using the accelerometer when GPS and the step counter are unavailable', () => {
    const detector = createMotionStatusDetector();
    const input = { location: null, pedometerSteps: null, pedometerAvailable: false };

    expect(detector.update(getInput(0, input)).status).toBe('moving');
    expect(detector.update(getInput(1_000, input)).status).toBe('moving');
    expect(detector.update(getInput(2_000, input)).status).toBe('moving');
    expect(detector.update(getInput(31_000, input)).status).toBe('moving');

    const result = detector.update(getInput(32_000, input));

    expect(result.status).toBe('resting');
    expect(result.restingSources).toEqual(['accelerometer']);
  });

  it('uses the available GPS and accelerometer signals when the step counter is unavailable', () => {
    const detector = createMotionStatusDetector();
    const result = [0, 1_000, 2_000, 31_000, 32_000].map((timestamp) =>
      detector.update(
        getInput(timestamp, {
          pedometerSteps: null,
          pedometerAvailable: false,
        }),
      ),
    );

    expect(result.at(-1)?.restingSources).toEqual(['accelerometer', 'gps']);
  });

  it('uses the available step counter and accelerometer signals when GPS is unavailable', () => {
    const detector = createMotionStatusDetector();
    const result = [0, 1_000, 2_000, 20_000, 49_000, 50_000].map((timestamp) =>
      detector.update(
        getInput(timestamp, {
          location: null,
        }),
      ),
    );

    expect(result.at(-1)?.restingSources).toEqual(['accelerometer', 'pedometer']);
  });

  it('returns to moving using the accelerometer when other motion services are unavailable', () => {
    const detector = createMotionStatusDetector();
    const unavailableServices = { location: null, pedometerSteps: null, pedometerAvailable: false };

    [0, 1_000, 2_000, 31_000].forEach((timestamp) => detector.update(getInput(timestamp, unavailableServices)));
    expect(detector.update(getInput(32_000, unavailableServices)).status).toBe('resting');

    [33_000, 34_000, 35_000, 36_000].forEach((timestamp) =>
      detector.update(
        getInput(timestamp, {
          ...unavailableServices,
          acceleration: clearlyMovingAcceleration,
        }),
      ),
    );
    const result = detector.update(
      getInput(37_000, {
        ...unavailableServices,
        acceleration: clearlyMovingAcceleration,
      }),
    );

    expect(result.status).toBe('moving');
    expect(result.restingSources).toEqual([]);
  });

  it('does not report rest when GPS detects cycling speed', () => {
    const detector = createMotionStatusDetector();

    for (const timestamp of [0, 10_000, 20_000, 30_000, 40_000]) {
      expect(
        detector.update(
          getInput(timestamp, {
            acceleration: movingAcceleration,
            location: {
              timestamp,
              coords: { latitude: 55, longitude: 37, speed: 5 },
            } as ReturnType<typeof getInput>['location'],
          }),
        ).status,
      ).toBe('moving');
    }
  });
});
