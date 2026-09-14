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

const { persistReducer, persistStore } = jest.requireActual('redux-persist') as typeof ReduxPersist;

const PERSIST_KEY = 'persist:root';
const RESET_STORE = 'app/resetStore';
const SESSION = {
  userId: 'cold-start-user',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};
const EXPECTED_AUTH = { ...SESSION, appVersion: '' };

type Runtime = ReturnType<typeof createRuntime>;

function createRuntime(storage: Storage = appStorage) {
  const baseReducer = combineReducers({ auth, trackingRecovery });
  const resettableReducer = (state: Parameters<typeof baseReducer>[0], action: Parameters<typeof baseReducer>[1]) =>
    action.type === RESET_STORE ? baseReducer(undefined, action) : baseReducer(state, action);
  const persistedReducer = persistReducer(
    {
      key: 'root',
      storage,
      whitelist: ['auth', 'trackingRecovery'],
    },
    resettableReducer,
  );
  let persistenceReadFailed = false;
  const reducer = (state: Parameters<typeof persistedReducer>[0], action: Parameters<typeof persistedReducer>[1]) => {
    const persistAction = action as typeof action & { err?: unknown; key?: string };
    const isFailedRehydrate =
      action.type === 'persist/REHYDRATE' && persistAction.key === 'root' && Boolean(persistAction.err);

    if (isFailedRehydrate) {
      persistenceReadFailed = true;
      const stateAfterFailedRehydrate = persistedReducer(state, { ...action, type: 'app/persistenceReadFailed' });
      return {
        ...stateAfterFailedRehydrate,
        _persist: {
          ...stateAfterFailedRehydrate._persist,
          rehydrated: false,
        },
      };
    }

    const canResumeAfterReadFailure =
      persistenceReadFailed &&
      state?._persist?.rehydrated === false &&
      (action.type === 'auth/setAuthSession' || action.type === 'auth/setAuthTokens');
    const stateForReducer = canResumeAfterReadFailure
      ? { ...state, _persist: { ...state._persist, rehydrated: true } }
      : state;
    if (canResumeAfterReadFailure) persistenceReadFailed = false;

    return persistedReducer(stateForReducer, action);
  };
  const runtimeStore = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });
  const runtimePersistor = persistStore(runtimeStore);

  return { store: runtimeStore, persistor: runtimePersistor };
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

async function closeRuntime({ persistor }: Runtime) {
  persistor.pause();
  await persistor.flush();
}

describe('cold start persistence', () => {
  beforeEach(async () => {
    await appStorage.removeItem(PERSIST_KEY);
  });

  afterEach(async () => {
    await appStorage.removeItem(PERSIST_KEY);
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
    await foreground.persistor.flush();
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
    await headlessLocationRuntime.persistor.flush();
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
    await foreground.persistor.flush();
    await closeRuntime(foreground);

    let releaseRead!: (value: string | null) => void;
    const delayedRead = new Promise<string | null>((resolve) => {
      releaseRead = resolve;
    });
    const delayedStorage: Storage = {
      ...appStorage,
      getItem: () => delayedRead,
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
    await headlessLocationRuntime.persistor.flush();

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
    await app.persistor.flush();

    await app.persistor.purge();
    app.store.dispatch({ type: RESET_STORE });
    expect(app.store.getState()._persist).toEqual(expect.objectContaining({ rehydrated: true }));

    app.store.dispatch(setAuthSession({ ...SESSION, userId: 'yandex-user' }));
    await app.persistor.flush();

    await app.persistor.purge();
    app.store.dispatch({ type: RESET_STORE });

    app.store.dispatch(setAuthSession({ ...SESSION, userId: 'vk-user' }));
    await app.persistor.flush();
    await closeRuntime(app);

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual({ ...SESSION, userId: 'vk-user', appVersion: '' });

    await closeRuntime(reopenedApp);
  });

  it('does not let a stale headless tracking runtime overwrite a newer auth session', async () => {
    const foreground = createRuntime();
    await waitForRehydration(foreground.persistor);
    foreground.store.dispatch(setAuthSession({ ...SESSION, userId: 'vk-user' }));
    await foreground.persistor.flush();

    const headlessLocationRuntime = createRuntime();
    await waitForRehydration(headlessLocationRuntime.persistor);

    await foreground.persistor.purge();
    foreground.store.dispatch({ type: RESET_STORE });
    foreground.store.dispatch(setAuthSession({ ...SESSION, userId: 'yandex-user' }));
    await foreground.persistor.flush();

    headlessLocationRuntime.store.dispatch(
      setTrackingRecoveryProgress({
        pointCount: 1,
        lastTimestamp: 10_000,
        metrics: TRACKING_RECOVERY_METRICS_INITIAL_STATE,
      }),
    );
    await headlessLocationRuntime.persistor.flush();

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual({ ...SESSION, userId: 'yandex-user', appVersion: '' });

    await closeRuntime(foreground);
    await closeRuntime(headlessLocationRuntime);
    await closeRuntime(reopenedApp);
  });

  it('does not overwrite auth when a headless runtime cannot read persist:root', async () => {
    const foreground = createRuntime();
    await waitForRehydration(foreground.persistor);
    foreground.store.dispatch(setAuthSession(SESSION));
    await foreground.persistor.flush();
    await closeRuntime(foreground);

    const readError = new Error('MMKV read failed');
    const headlessStorage: Storage = {
      ...appStorage,
      getItem: () => Promise.reject(readError),
    };
    const headlessLocationRuntime = createRuntime(headlessStorage);
    await waitForRehydration(headlessLocationRuntime.persistor);
    await headlessLocationRuntime.persistor.flush();
    await closeRuntime(headlessLocationRuntime);

    const reopenedApp = createRuntime();
    await waitForRehydration(reopenedApp.persistor);

    expect(reopenedApp.store.getState().auth).toEqual(EXPECTED_AUTH);

    await closeRuntime(reopenedApp);
  });
});
