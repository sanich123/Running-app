import type { STATUSES } from '@const/enums';
import type { LastKmSplit } from '@R/slices/location/types';
import type { LocationObject } from 'expo-location';

export interface TrackingRecoveryMetrics {
  initialLocation: LocationObject | null;
  lastPosition: LocationObject | null;
  distance: number;
  steps: number;
  duration: number;
  durationAtLastLocation: number;
  durationTimerBase: number;
  durationTimerStartedAt: number | null;
  durationWithPauses: number;
  altitude: number;
  lastKilometerAltitude: number;
  lastKilometer: number;
  lastKilometerDuration: number;
  currentPace: number;
  kilometresSplit: LastKmSplit[];
}

export interface TrackingRecoveryState {
  journalId: string | null;
  status: STATUSES;
  pointCount: number;
  lastTimestamp: number | null;
  metrics: TrackingRecoveryMetrics;
}
