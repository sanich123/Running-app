import { appStorage } from '@U/storage/storage';
import { AUTH_INITIAL_STATE } from './const';
import type { Persistor } from 'redux-persist';

export const AUTH_PERSIST_KEY = 'persist:auth';

interface AuthStore {
  getState(): { auth: unknown };
  subscribe(listener: () => void): () => void;
}

let authPersistor: Persistor | undefined;
let pendingAuthWrite: Promise<void> = Promise.resolve();
let previousAuthState: unknown;
let unsubscribeFromAuthStore: (() => void) | undefined;

function queueAuthWrite(authState: unknown) {
  const serializedAuthState = JSON.stringify(authState);
  pendingAuthWrite = pendingAuthWrite
    .catch(() => undefined)
    .then(() => appStorage.setItem(AUTH_PERSIST_KEY, serializedAuthState));
}

export function configureAuthPersistence(persistor: Persistor, store: AuthStore) {
  authPersistor = persistor;
  previousAuthState = store.getState().auth;
  unsubscribeFromAuthStore?.();
  unsubscribeFromAuthStore = store.subscribe(() => {
    const nextAuthState = store.getState().auth;
    const isRehydrationInProgress = !persistor.getState().bootstrapped;
    if (nextAuthState === previousAuthState) return;
    previousAuthState = nextAuthState;
    if (isRehydrationInProgress) return;
    queueAuthWrite(nextAuthState);
  });
}

export async function readPersistedAuth() {
  const serializedAuthState = await appStorage.getItem(AUTH_PERSIST_KEY);
  return serializedAuthState ? JSON.parse(serializedAuthState) : undefined;
}

export async function purgeAuthPersistence() {
  pendingAuthWrite = pendingAuthWrite
    .catch(() => undefined)
    // Keep an empty auth tombstone. It prevents a stale legacy auth value in
    // persist:root from restoring a session after logout.
    .then(() => appStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(AUTH_INITIAL_STATE)));
  await pendingAuthWrite;
}

export async function flushAuthPersistence() {
  await pendingAuthWrite;
  await authPersistor?.flush();
}
