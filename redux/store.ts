import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';

import activity from './activity/activity';
import language from './language/language';
import location from './location/location';
import network from './network/network';
import profile from './profile/profile';
import { runichApi } from './runich-api/runich-api';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['language', 'activity', 'location'],
};

const rootReducer = persistReducer(
  persistConfig,
  combineReducers({
    network,
    language,
    location,
    profile,
    activity,
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
