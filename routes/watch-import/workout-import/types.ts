import type { HealthConnectReadStage } from '../../../modules/runich-health/src/RunichHealth';

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

export interface UploadDiagnostics {
  at: string;
  outcome: 'sending' | 'success' | 'error' | 'skipped';
  workoutCount: number;
  sourceRoutePointCount: number;
  payloadRoutePointCount: number;
  skipReason?: UploadSkipReason;
  imported?: number;
  skipped?: number;
  errorStatus?: string;
}
