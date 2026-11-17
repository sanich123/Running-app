import {
  beginHealthSyncOperation,
  cancelHealthSyncOperation,
  finishHealthSyncOperation,
} from './health-sync-cancellation';

describe('health sync cancellation', () => {
  it('allows one active operation and only cancels or finishes its matching id', () => {
    const operation = beginHealthSyncOperation();
    expect(operation).not.toBeNull();
    if (!operation) throw new Error('Expected a health sync operation to start');

    expect(beginHealthSyncOperation()).toBeNull();
    expect(cancelHealthSyncOperation(`${operation.id}-stale`)).toBe(false);
    expect(operation.signal.aborted).toBe(false);

    finishHealthSyncOperation(`${operation.id}-stale`);
    expect(beginHealthSyncOperation()).toBeNull();
    expect(cancelHealthSyncOperation(operation.id)).toBe(true);
    expect(operation.signal.aborted).toBe(true);

    finishHealthSyncOperation(operation.id);
    expect(cancelHealthSyncOperation(operation.id)).toBe(false);
  });
});
