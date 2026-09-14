import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { getStoredState as reduxPersistGetStoredState, persistStore, persistReducer } from 'redux-persist';
import { appStorage } from '@U/storage/storage';
import { createProfileListenerMiddleware } from './middleware/profile-listener';
import { reportPersistenceError } from './persistence-errors';
import { runichApi } from './runich-api/runich-api';
import activity from './slices/activity/activity';
import auth from './slices/auth/auth';
import { configureAuthPersistence } from './slices/auth/persistence';
import comment from './slices/comment/comment';
import location from './slices/location/location';
import logining from './slices/logining/logining';
import mainFeed from './slices/main-feed/main-feed';
import migration from './slices/migration/migration';
import network from './slices/network/network';
import profile from './slices/profile/profile';
import settings from './slices/settings/settings';
import trackingRecovery from './slices/tracking-recovery/tracking-recovery';
import type { Action, Reducer } from '@reduxjs/toolkit';
import type { PersistedState } from 'redux-persist';

const getStoredStateWithErrorToast = async (
  config: Parameters<typeof reduxPersistGetStoredState>[0],
): Promise<PersistedState> => {
  try {
    return (await reduxPersistGetStoredState(config)) as PersistedState;
  } catch (error) {
    reportPersistenceError('Не удалось восстановить данные приложения из локального хранилища (persist:root)', error);
    throw error;
  }
};

const persistConfig = {
  key: 'root',
  storage: appStorage,
  whitelist: ['settings', 'activity', 'trackingRecovery', 'auth'],
  getStoredState: getStoredStateWithErrorToast,
};

const appReducer = combineReducers({
  network,
  settings,
  location,
  profile,
  activity,
  trackingRecovery,
  mainFeed,
  migration,
  auth,
  logining,
  comment,
  [runichApi.reducerPath]: runichApi.reducer,
});

export const RESET_STORE = 'app/resetStore';
export const resetStore = () => ({ type: RESET_STORE });

type AppState = ReturnType<typeof appReducer>;
const profileListenerMiddleware = createProfileListenerMiddleware<AppState>();
const resettableReducer: Reducer<AppState, Action> = (state, action) =>
  action.type === RESET_STORE ? appReducer(undefined, action) : appReducer(state, action);
const persistedReducer = persistReducer(persistConfig, resettableReducer);
interface PersistMeta {
  version?: number;
  rehydrated: boolean;
}

interface PersistedAppState extends AppState {
  _persist?: PersistMeta;
}
const runPersistedReducer = persistedReducer as unknown as Reducer<PersistedAppState, Action>;
let persistenceReadFailed = false;

const rootReducer: Reducer<PersistedAppState, Action> = (state, action) => {
  const persistAction = action as Action & { err?: unknown; key?: string };
  const isFailedRehydrate =
    action.type === 'persist/REHYDRATE' && persistAction.key === persistConfig.key && Boolean(persistAction.err);

  if (isFailedRehydrate) {
    persistenceReadFailed = true;

    // Do not let redux-persist enqueue the initial empty state after a read
    // failure. A headless location runtime must never erase a valid session.
    const stateAfterFailedRehydrate = runPersistedReducer(state, {
      ...action,
      type: 'app/persistenceReadFailed',
    });

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
    ? {
        ...state,
        _persist: { ...state._persist, rehydrated: true },
      }
    : state;

  if (canResumeAfterReadFailure) persistenceReadFailed = false;

  return runPersistedReducer(stateForReducer, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(profileListenerMiddleware.middleware, runichApi.middleware),
});
setupListeners(store.dispatch);
export const persistor = persistStore(store);
configureAuthPersistence(persistor);

export type RootState = AppState;
export type AppDispatch = typeof store.dispatch;
