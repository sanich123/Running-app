import { STATUSES } from '@const/enums';
import type { TrackingRecoveryMetrics, TrackingRecoveryState } from './types';

export const TRACKING_RECOVERY_METRICS_INITIAL_STATE: TrackingRecoveryMetrics = {
  initialLocation: null,
  lastPosition: null,
  distance: 0,
  steps: 0,
  duration: 0,
  durationAtLastLocation: 0,
  durationTimerBase: 0,
  durationTimerStartedAt: null,
  recordingStartedAt: null,
  recordingTimeZone: null,
  altitude: 0,
  lastKilometerAltitude: 0,
  lastKilometer: 0,
  lastKilometerDuration: 0,
  currentPace: 0,
  kilometresSplit: [],
};

export const TRACKING_RECOVERY_INITIAL_STATE: TrackingRecoveryState = {
  journalId: null,
  status: STATUSES.initial,
  pointCount: 0,
  lastTimestamp: null,
  metrics: TRACKING_RECOVERY_METRICS_INITIAL_STATE,
};
