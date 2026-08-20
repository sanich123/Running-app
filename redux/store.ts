import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import { appStorage } from '@U/storage/storage';
import { createProfileListenerMiddleware } from './middleware/profile-listener';
import { runichApi } from './runich-api/runich-api';
import activity from './slices/activity/activity';
import auth from './slices/auth/auth';
import comment from './slices/comment/comment';
import location from './slices/location/location';
import logining from './slices/logining/logining';
import mainFeed from './slices/main-feed/main-feed';
import network from './slices/network/network';
import profile from './slices/profile/profile';
import settings from './slices/settings/settings';
import type { Action, Reducer } from '@reduxjs/toolkit';

const persistConfig = {
  key: 'root',
  storage: appStorage,
  whitelist: ['settings', 'activity', 'location', 'auth'],
};

const appReducer = combineReducers({
  network,
  settings,
  location,
  profile,
  activity,
  mainFeed,
  auth,
  logining,
  comment,
  [runichApi.reducerPath]: runichApi.reducer,
});

export const RESET_STORE = 'app/resetStore';
export const resetStore = () => ({ type: RESET_STORE });

type AppState = ReturnType<typeof appReducer>;
const profileListenerMiddleware = createProfileListenerMiddleware();
const persistedReducer = persistReducer(persistConfig, appReducer);
const rootReducer: Reducer<AppState, Action> = (state, action) =>
  (persistedReducer as unknown as Reducer<AppState, Action>)(action.type === RESET_STORE ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(profileListenerMiddleware.middleware, runichApi.middleware),
});
setupListeners(store.dispatch);
export const persistor = persistStore(store);

export type RootState = AppState;
export type AppDispatch = typeof store.dispatch;
