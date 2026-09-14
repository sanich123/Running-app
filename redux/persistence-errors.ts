export interface PersistenceError {
  message: string;
  error: unknown;
}

const pendingErrors: PersistenceError[] = [];
let listener: ((persistenceError: PersistenceError) => void) | undefined;

export function reportPersistenceError(message: string, error: unknown) {
  const persistenceError = { message, error };

  if (listener) {
    listener(persistenceError);
    return;
  }

  pendingErrors.push(persistenceError);
}

export function subscribeToPersistenceErrors(nextListener: (persistenceError: PersistenceError) => void) {
  listener = nextListener;
  pendingErrors.splice(0).forEach(nextListener);

  return () => {
    if (listener === nextListener) listener = undefined;
  };
}
