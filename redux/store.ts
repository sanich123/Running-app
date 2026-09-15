import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { getStoredState as reduxPersistGetStoredState, persistStore, persistReducer } from 'redux-persist';
import { appStorage } from '@U/storage/storage';
import { createProfileListenerMiddleware } from './middleware/profile-listener';
import { runichApi } from './runich-api/runich-api';
import activity from './slices/activity/activity';
import auth from './slices/auth/auth';
import { configureAuthPersistence, readPersistedAuth } from './slices/auth/persistence';
import comment from './slices/comment/comment';
import location from './slices/location/location';
import logining from './slices/logining/logining';
import mainFeed from './slices/main-feed/main-feed';
import migration from './slices/migration/migration';
import network from './slices/network/network';
import settings from './slices/settings/settings';
import trackingRecovery from './slices/tracking-recovery/tracking-recovery';
import type { Action, Reducer } from '@reduxjs/toolkit';
import type { PersistedState } from 'redux-persist';

const getStoredStateWithAuth = async (
  config: Parameters<typeof reduxPersistGetStoredState>[0],
): Promise<PersistedState> => {
  const persistedAuth = await readPersistedAuth();
  const persistedState = (await reduxPersistGetStoredState(config)) as PersistedState & Record<string, unknown>;
  return (persistedAuth === undefined ? persistedState : { ...persistedState, auth: persistedAuth }) as PersistedState;
};

const persistConfig = {
  key: 'root',
  storage: appStorage,
  whitelist: ['settings', 'activity', 'trackingRecovery', 'auth'],
  getStoredState: getStoredStateWithAuth,
};

const appReducer = combineReducers({
  network,
  settings,
  location,
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
const rootReducer: Reducer<AppState, Action> = persistedReducer as unknown as Reducer<AppState, Action>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(profileListenerMiddleware.middleware, runichApi.middleware),
});
setupListeners(store.dispatch);
export const persistor = persistStore(store);
configureAuthPersistence(persistor, store);

export type RootState = AppState;
export type AppDispatch = typeof store.dispatch;
