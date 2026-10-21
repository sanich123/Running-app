import type { HealthConnectReadStage, HealthStore } from '../../../modules/runich-health/src/RunichHealth';

export interface ReadDiagnostics {
  at: string;
  startDate: string;
  endDate: string;
  outcome: 'reading' | 'success' | 'error';
  workoutCount: number;
  stage?: HealthConnectReadStage;
  sessionCount?: number;
  processedSessionCount?: number;
  errorCode?: string;
}

export type UploadSkipReason = 'read-failed' | 'no-user' | 'no-workouts' | 'manual-selection';

export type WorkoutUploadOutcome = 'not-sent' | 'sending' | 'uploaded' | 'error';

export interface WorkoutUploadDiagnostic {
  source: HealthStore;
  sourceActivityId: string;
  sourceHeartRateSampleCount: number;
  payloadHeartRateSampleCount: number;
  outcome: WorkoutUploadOutcome;
}

export interface UploadDiagnostics {
  at: string;
  outcome: 'sending' | 'success' | 'error' | 'skipped';
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
