import type { LocationObject } from 'expo-location';

export interface AccelerationSample {
  x: number;
  y: number;
  z: number;
}

export interface MotionDetectionInput {
  timestamp: number;
  acceleration: AccelerationSample;
  location: LocationObject | null;
  pedometerSteps: number | null;
  pedometerAvailable: boolean;
}

export type MotionStatus = 'moving' | 'resting';

export type MotionSource = 'accelerometer' | 'gps' | 'pedometer';

export interface MotionDetectionResult {
  status: MotionStatus;
  stillSignals: number;
  movingSignals: number;
  restingSources: MotionSource[];
}
