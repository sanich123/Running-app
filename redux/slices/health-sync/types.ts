import type { HealthStore } from '../../../modules/runich-health/src/RunichHealth';

export interface HealthSyncStatus {
  id: string;
  source: HealthStore;
  phase: 'reading' | 'sending';
  foundCount: number | null;
  processedCount: number;
}

export interface HealthSyncState {
  status: HealthSyncStatus | null;
}
