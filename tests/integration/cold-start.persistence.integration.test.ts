import { combineReducers, configureStore } from '@reduxjs/toolkit';
import auth, { setAuthSession } from '@R/slices/auth/auth';
import { TRACKING_RECOVERY_METRICS_INITIAL_STATE } from '@R/slices/tracking-recovery/const';
import trackingRecovery, {
  setTrackingRecoveryProgress,
  startTrackingRecovery,
} from '@R/slices/tracking-recovery/tracking-recovery';
import { appStorage } from '@U/storage/storage';
import type { Persistor, Storage } from 'redux-persist';
import type * as ReduxPersist from 'redux-persist';

const { getStoredState, persistReducer, persistStore } = jest.requireActual('redux-persist') as typeof ReduxPersist;

const PERSIST_KEY = 'persist:root';
const AUTH_PERSIST_KEY = 'persist:auth';
const RESET_STORE = 'app/resetStore';
const SESSION = {
  userId: 'cold-start-user',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};
const EXPECTED_AUTH = SESSION;
const EMPTY_AUTH = { accessToken: '', refreshToken: '', userId: '' };

type Runtime = ReturnType<typeof createRuntime>;

function createRuntime(storage: Storage = appStorage) {
  const baseReducer = combineReducers({ auth, trackingRecovery });
  const resettableReducer = (state: Parameters<typeof baseReducer>[0], action: Parameters<typeof baseReducer>[1]) =>
    action.type === RESET_STORE ? baseReducer(undefined, action) : baseReducer(state, action);
  const getStoredStateWithAuth = async (config: Parameters<typeof getStoredState>[0]) => {
    const serializedAuthState = await storage.getItem(AUTH_PERSIST_KEY);
    const persistedAuth = serializedAuthState ? JSON.parse(serializedAuthState) : undefined;

    const persistedState = await getStoredState(config);
    return (
      persistedAuth === undefined ? persistedState : { ...persistedState, auth: persistedAuth }
    ) as ReduxPersist.PersistedState;
  };
  const persistedReducer = persistReducer(
    {
      key: 'root',
      storage,
      whitelist: ['auth', 'trackingRecovery'],
      getStoredState: getStoredStateWithAuth,
    },
    resettableReducer,
  );
  const reducer = (state: Parameters<typeof persistedReducer>[0], action: Parameters<typeof persistedReducer>[1]) => {
    return persistedReducer(state, action);
  };
  const runtimeStore = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });
  const runtimePersistor = persistStore(runtimeStore);
  let previousAuthState = runtimeStore.getState().auth;
  let pendingAuthWrite: Promise<void> = Promise.resolve();
  runtimeStore.subscribe(() => {
    const nextAuthState = runtimeStore.getState().auth;
    if (nextAuthState === previousAuthState) return;
    previousAuthState = nextAuthState;
    if (!runtimePersistor.getState().bootstrapped) return;
    pendingAuthWrite = pendingAuthWrite.then(() => storage.setItem(AUTH_PERSIST_KEY, JSON.stringify(nextAuthState)));
  });

  return {
    store: runtimeStore,
    persistor: runtimePersistor,
    flush: async () => {
      await pendingAuthWrite;
      await runtimePersistor.flush();
    },
  };
}

async function waitForRehydration(persistor: Persistor) {
  if (persistor.getState().bootstrapped) return;

  await new Promise<void>((resolve) => {
    const unsubscribe = persistor.subscribe(() => {
      if (!persistor.getState().bootstrapped) return;
      unsubscribe();
      resolve();
    });
  });
}

async function closeRuntime(runtime: Runtime) {
  runtime.persistor.pause();
  await runtime.flush();
}

describe('cold start persistence', () => {
  beforeEach(async () => {
    await appStorage.removeItem(PERSIST_KEY);
    await appStorage.removeItem(AUTH_PERSIST_KEY);
  });

  afterEach(async () => {
    await appStorage.removeItem(PERSIST_KEY);
    await appStorage.removeItem(AUTH_PERSIST_KEY);
  });

  it('restores auth after a cold start when active tracking updates persisted state', async () => {
    const foreground = createRuntime();
    await waitForRehydration(foreground.persistor);

    foreground.store.dispatch(setAuthSession(SESSION));
    foreground.store.dispatch(startTrackingRecovery('tracking-journal'));
    foreground.store.dispatch(
      setTrackingRecoveryProgress({
        pointCount: 1,
        lastTimestamp: 10_000,
        metrics: TRACKING_RECOVERY_METRICS_INITIAL_STATE,
      }),
    );
    await foreground.flush();
    await closeRuntime(foreground);

    const headlessLocationRuntime = createRuntime();
    await waitForRehydration(headlessLocationRuntime.persistor);
    headlessLocationRuntime.store.dispatch(
      setTrackingRecoveryProgress({
        pointCount: 2,
        lastTimestamp: 11_000,
        metrics: TRACKING_RECOVERY_METRICS_INITIAL_STATE,
      }),
    );
    await headlessLocationRuntime.flush();
    await closeRuntime(headlessLocationRuntime);

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual(EXPECTED_AUTH);
    expect(reopenedApp.store.getState().trackingRecovery.pointCount).toBe(2);

    await closeRuntime(reopenedApp);
  });

  it('does not persist a tracking update dispatched before rehydration completes', async () => {
    const foreground = createRuntime();
    await waitForRehydration(foreground.persistor);
    foreground.store.dispatch(setAuthSession(SESSION));
    await foreground.flush();
    await closeRuntime(foreground);

    let releaseRead!: (value: string | null) => void;
    const delayedRead = new Promise<string | null>((resolve) => {
      releaseRead = resolve;
    });
    const delayedStorage: Storage = {
      ...appStorage,
      getItem: (key) => (key === AUTH_PERSIST_KEY ? appStorage.getItem(key) : delayedRead),
    };

    const headlessLocationRuntime = createRuntime(delayedStorage);
    headlessLocationRuntime.store.dispatch(
      setTrackingRecoveryProgress({
        pointCount: 1,
        lastTimestamp: 10_000,
        metrics: TRACKING_RECOVERY_METRICS_INITIAL_STATE,
      }),
    );

    releaseRead(await appStorage.getItem(PERSIST_KEY));
    await waitForRehydration(headlessLocationRuntime.persistor);
    await headlessLocationRuntime.flush();

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual(EXPECTED_AUTH);

    await closeRuntime(headlessLocationRuntime);
    await closeRuntime(reopenedApp);
  });

  it('preserves auth after two social logout/login cycles', async () => {
    const app = createRuntime();
    await waitForRehydration(app.persistor);

    app.store.dispatch(setAuthSession({ ...SESSION, userId: 'vk-user' }));
    await app.flush();

    await app.persistor.purge();
    app.store.dispatch({ type: RESET_STORE });
    expect(app.store.getState()._persist).toEqual(expect.objectContaining({ rehydrated: true }));

    app.store.dispatch(setAuthSession({ ...SESSION, userId: 'yandex-user' }));
    await app.flush();

    await app.persistor.purge();
    app.store.dispatch({ type: RESET_STORE });

    app.store.dispatch(setAuthSession({ ...SESSION, userId: 'vk-user' }));
    await app.flush();
    await closeRuntime(app);

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual({ ...SESSION, userId: 'vk-user' });

    await closeRuntime(reopenedApp);
  });

  it('does not let a stale headless tracking runtime overwrite a newer auth session', async () => {
    const foreground = createRuntime();
    await waitForRehydration(foreground.persistor);
    foreground.store.dispatch(setAuthSession({ ...SESSION, userId: 'vk-user' }));
    await foreground.flush();

    const headlessLocationRuntime = createRuntime();
    await waitForRehydration(headlessLocationRuntime.persistor);

    await foreground.persistor.purge();
    foreground.store.dispatch({ type: RESET_STORE });
    foreground.store.dispatch(setAuthSession({ ...SESSION, userId: 'yandex-user' }));
    await foreground.flush();

    headlessLocationRuntime.store.dispatch(
      setTrackingRecoveryProgress({
        pointCount: 1,
        lastTimestamp: 10_000,
        metrics: TRACKING_RECOVERY_METRICS_INITIAL_STATE,
      }),
    );
    await headlessLocationRuntime.flush();

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual({ ...SESSION, userId: 'yandex-user' });

    await closeRuntime(foreground);
    await closeRuntime(headlessLocationRuntime);
    await closeRuntime(reopenedApp);
  });

  it('does not restore a session from a headless rehydration that started before logout', async () => {
    const foreground = createRuntime();
    await waitForRehydration(foreground.persistor);
    foreground.store.dispatch(setAuthSession({ ...SESSION, userId: 'vk-user' }));
    await foreground.flush();

    const persistedAuth = await appStorage.getItem(AUTH_PERSIST_KEY);
    let releaseAuth!: (value: string | null) => void;
    const delayedAuthRead = new Promise<string | null>((resolve) => {
      releaseAuth = resolve;
    });
    const delayedAuthStorage: Storage = {
      ...appStorage,
      getItem: (key) => (key === AUTH_PERSIST_KEY ? delayedAuthRead : appStorage.getItem(key)),
    };
    const headlessLocationRuntime = createRuntime(delayedAuthStorage);

    await foreground.persistor.purge();
    foreground.store.dispatch({ type: RESET_STORE });
    await foreground.flush();
    await appStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(EMPTY_AUTH));
    releaseAuth(persistedAuth);
    await waitForRehydration(headlessLocationRuntime.persistor);

    headlessLocationRuntime.store.dispatch(
      setTrackingRecoveryProgress({
        pointCount: 1,
        lastTimestamp: 10_000,
        metrics: TRACKING_RECOVERY_METRICS_INITIAL_STATE,
      }),
    );
    await headlessLocationRuntime.flush();

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual(EMPTY_AUTH);

    await closeRuntime(foreground);
    await closeRuntime(headlessLocationRuntime);
    await closeRuntime(reopenedApp);
  });
});
