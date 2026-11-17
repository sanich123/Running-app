interface ActiveHealthSync {
  id: string;
  controller: AbortController;
}

export interface HealthSyncOperation {
  id: string;
  signal: AbortSignal;
}

let activeHealthSync: ActiveHealthSync | null = null;
let operationSequence = 0;

export function beginHealthSyncOperation(): HealthSyncOperation | null {
  if (activeHealthSync) return null;

  const controller = new AbortController();
  const id = `${Date.now()}-${++operationSequence}`;
  activeHealthSync = { id, controller };
  return { id, signal: controller.signal };
}

export function cancelHealthSyncOperation(id: string): boolean {
  if (!activeHealthSync || activeHealthSync.id !== id) return false;
  activeHealthSync.controller.abort();
  return true;
}

export function finishHealthSyncOperation(id: string): void {
  if (activeHealthSync?.id === id) activeHealthSync = null;
}
