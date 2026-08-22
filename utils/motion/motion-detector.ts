import {
  ACCELERATION_HISTORY_LENGTH,
  ACCELERATION_MOVEMENT_THRESHOLD,
  ACCELERATION_STILLNESS_THRESHOLD,
  GPS_MOVING_SPEED_MPS,
  GPS_SIGNAL_MAX_AGE_MS,
  GPS_STILL_SPEED_MPS,
  MOVEMENT_CONFIRMATION_MS,
  PEDOMETER_STILLNESS_MS,
  STILLNESS_CONFIRMATION_MS,
} from './const';
import type { MotionDetectionInput, MotionDetectionResult, MotionSource } from './types';

function getAccelerationDeviation({ x, y, z }: MotionDetectionInput['acceleration']) {
  const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  return Math.abs(magnitude - 1);
}

function getFreshLocationSpeed(input: MotionDetectionInput) {
  const { location, timestamp } = input;
  if (!location || !Number.isFinite(location.timestamp) || timestamp - location.timestamp > GPS_SIGNAL_MAX_AGE_MS) {
    return null;
  }

  const speed = location.coords.speed;
  return typeof speed === 'number' && Number.isFinite(speed) ? Math.max(0, speed) : null;
}

export function createMotionStatusDetector() {
  let status: MotionDetectionResult['status'] = 'moving';
  let stillSince: number | null = null;
  let movingSince: number | null = null;
  let lastStepCount: number | null = null;
  let lastStepTimestamp: number | null = null;
  let accelerationHistory: number[] = [];
  let restingSources: MotionSource[] = [];

  return {
    update(input: MotionDetectionInput): MotionDetectionResult {
      const accelerationDeviation = getAccelerationDeviation(input.acceleration);
      accelerationHistory = [...accelerationHistory, accelerationDeviation].slice(-ACCELERATION_HISTORY_LENGTH);

      const stepsChanged =
        input.pedometerAvailable &&
        lastStepCount !== null &&
        input.pedometerSteps !== null &&
        input.pedometerSteps > lastStepCount;
      if (input.pedometerAvailable && input.pedometerSteps !== null) {
        if (lastStepCount === null || stepsChanged) {
          lastStepTimestamp = input.timestamp;
        }
        lastStepCount = input.pedometerSteps;
      }

      const averageAccelerationDeviation =
        accelerationHistory.reduce((sum, deviation) => sum + deviation, 0) / accelerationHistory.length;
      const accelerometerIsStill =
        accelerationHistory.length >= 3 && averageAccelerationDeviation <= ACCELERATION_STILLNESS_THRESHOLD;
      const accelerometerIsMoving =
        accelerationHistory.length >= 3 && averageAccelerationDeviation >= ACCELERATION_MOVEMENT_THRESHOLD;
      const locationSpeed = getFreshLocationSpeed(input);
      const gpsIsStill = locationSpeed !== null && locationSpeed <= GPS_STILL_SPEED_MPS;
      const gpsIsMoving = locationSpeed !== null && locationSpeed >= GPS_MOVING_SPEED_MPS;
      const pedometerIsStill =
        input.pedometerAvailable &&
        lastStepTimestamp !== null &&
        input.timestamp - lastStepTimestamp >= PEDOMETER_STILLNESS_MS;

      const availableSignals = [
        accelerationHistory.length >= 3,
        locationSpeed !== null,
        input.pedometerAvailable && lastStepTimestamp !== null,
      ].filter(Boolean).length;
      const requiredSignals = Math.min(2, availableSignals);
      const stillSources: MotionSource[] = [
        accelerometerIsStill ? 'accelerometer' : null,
        gpsIsStill ? 'gps' : null,
        pedometerIsStill ? 'pedometer' : null,
      ].filter((source): source is MotionSource => source !== null);
      const stillSignals = stillSources.length;
      const movingSignals = [accelerometerIsMoving, gpsIsMoving, stepsChanged].filter(Boolean).length;
      const hasStillnessEvidence = requiredSignals > 0 && stillSignals >= requiredSignals;
      const hasMovementEvidence =
        gpsIsMoving || stepsChanged || (requiredSignals > 0 && movingSignals >= requiredSignals);

      if (hasMovementEvidence) {
        stillSince = null;
        movingSince ??= input.timestamp;
        if (status === 'resting' && input.timestamp - movingSince >= MOVEMENT_CONFIRMATION_MS) {
          status = 'moving';
          restingSources = [];
        }
      } else {
        movingSince = null;
        if (hasStillnessEvidence) {
          stillSince ??= input.timestamp;
          if (status === 'moving' && input.timestamp - stillSince >= STILLNESS_CONFIRMATION_MS) {
            status = 'resting';
            restingSources = stillSources;
          } else if (status === 'resting') {
            restingSources = stillSources;
          }
        } else {
          stillSince = null;
        }
      }

      return { status, stillSignals, movingSignals, restingSources };
    },
    reset() {
      status = 'moving';
      stillSince = null;
      movingSince = null;
      lastStepCount = null;
      lastStepTimestamp = null;
      accelerationHistory = [];
      restingSources = [];
    },
  };
}
