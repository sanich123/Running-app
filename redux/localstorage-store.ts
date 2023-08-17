export function loadState() {
  try {
    const serializedState = localStorage.getItem('redux');
    if (!serializedState) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
}

export function saveState(state: unknown): void {
  try {
    const serializedState = JSON.stringify(state);
    return localStorage.setItem('redux', serializedState);
  } catch {
    /* empty */
  }
}
