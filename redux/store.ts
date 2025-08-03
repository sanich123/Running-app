import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import activity from './slices/activity/activity';
import language from './slices/language/language';
import location from './slices/location/location';
import mainFeed from './slices/main-feed/main-feed';
import network from './slices/network/network';
import profile from './slices/profile/profile';
import auth from './slices/auth/auth';
import { runichApi } from './runich-api/runich-api';
import logining from './slices/logining/logining';
import manualActivity from './slices/manual-activity/manual-activity';
import additionalInfoActivity from './slices/actitivity-additional-info/activity-additional-info';
import unsendedActivity from './slices/unsended-activity/unsended-activity';
import comment from './slices/comment/comment';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['language', 'activity', 'location', 'auth'],
};

const rootReducer = persistReducer(
  persistConfig,
  combineReducers({
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
  }),
);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(runichApi.middleware),
});
setupListeners(store.dispatch);
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
