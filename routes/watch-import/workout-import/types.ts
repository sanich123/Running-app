import type { HealthConnectReadStage, HealthStore } from '../../../modules/runich-health/src/RunichHealth';

export interface ReadDiagnostics {
  at: string;
  startDate: string;
  endDate: string;
  outcome: 'reading' | 'success' | 'error' | 'cancelled';
  workoutCount: number;
  stage?: HealthConnectReadStage;
  sessionCount?: number;
  processedSessionCount?: number;
  errorCode?: string;
}

export type UploadSkipReason = 'read-failed' | 'no-user' | 'no-workouts' | 'already-synced' | 'manual-selection';

export type WorkoutUploadOutcome = 'not-sent' | 'sending' | 'imported' | 'skipped' | 'error' | 'cancelled';

export interface WorkoutUploadDiagnostic {
  source: HealthStore;
  sourceActivityId: string;
  sourceHeartRateSampleCount: number;
  payloadHeartRateSampleCount: number;
  outcome: WorkoutUploadOutcome;
}

export interface UploadDiagnostics {
  at: string;
  outcome: 'sending' | 'success' | 'error' | 'skipped' | 'cancelled';
  workoutCount: number;
  sourceRoutePointCount: number;
  payloadRoutePointCount: number;
  sourceHeartRateSampleCount: number;
  payloadHeartRateSampleCount: number;
  workouts: WorkoutUploadDiagnostic[];
  skipReason?: UploadSkipReason;
  imported?: number;
  skipped?: number;
  errorStatus?: string;
}

export interface DiagnosticItem {
  label: string;
  tone?: 'default' | 'muted' | 'success' | 'error';
  value: string;
}
