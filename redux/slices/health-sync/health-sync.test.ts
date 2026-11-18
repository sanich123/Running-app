import healthSync, { clearHealthSyncStatus, setHealthSyncStatus } from './health-sync';

describe('health sync reducer', () => {
  it('clears only the matching operation or an unconditionally cleared status', () => {
    const status = {
      id: 'sync-1',
      source: 'health-connect',
      phase: 'reading',
      foundCount: 4,
      processedCount: 0,
    } as const;
    const state = healthSync(undefined, setHealthSyncStatus(status));

    expect(healthSync(state, clearHealthSyncStatus('stale-sync'))).toEqual({ status });
    expect(healthSync(state, clearHealthSyncStatus(status.id))).toEqual({ status: null });
    expect(healthSync(state, clearHealthSyncStatus())).toEqual({ status: null });
  });
});
