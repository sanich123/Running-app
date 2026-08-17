import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import { appStorage } from '@U/storage/storage';
import { runichApi } from './runich-api/runich-api';
import additionalInfoActivity from './slices/activity-additional-info/activity-additional-info';
import activity from './slices/activity/activity';
import auth from './slices/auth/auth';
import comment from './slices/comment/comment';
import language from './slices/language/language';
import location from './slices/location/location';
import logining from './slices/logining/logining';
import mainFeed from './slices/main-feed/main-feed';
import manualActivity from './slices/manual-activity/manual-activity';
import network from './slices/network/network';
import profile from './slices/profile/profile';
import unsendedActivity from './slices/unsended-activity/unsended-activity';
import type { Action, Reducer } from '@reduxjs/toolkit';

const persistConfig = {
  key: 'root',
  storage: appStorage,
  whitelist: ['language', 'activity', 'location', 'auth', 'unsendedActivity'],
};

const appReducer = combineReducers({
  network,
  language,
  location,
  profile,
  activity,
  mainFeed,
  auth,
  logining,
  manualActivity,
  additionalInfoActivity,
  unsendedActivity,
  comment,
  [runichApi.reducerPath]: runichApi.reducer,
});

export const RESET_STORE = 'app/resetStore';
export const resetStore = () => ({ type: RESET_STORE });

type AppState = ReturnType<typeof appReducer>;
const persistedReducer = persistReducer(persistConfig, appReducer);
const rootReducer: Reducer<AppState, Action> = (state, action) =>
  (persistedReducer as unknown as Reducer<AppState, Action>)(action.type === RESET_STORE ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(runichApi.middleware),
});
setupListeners(store.dispatch);
export const persistor = persistStore(store);

export type RootState = AppState;
export type AppDispatch = typeof store.dispatch;
