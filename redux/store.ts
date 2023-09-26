import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import changeThemeLangReducer from './change-lang-slice/change-lang-slice';
import locationSlice from './location-slice/location-slice';
import { runnichApi } from './runnich-api/runnich-api';
import userInfoSlice from './user-info-slice/user-info-slice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = persistReducer(
  persistConfig,
  combineReducers({
    changeThemeLang: changeThemeLangReducer,
    location: locationSlice,
    userInfo: userInfoSlice,
    [runnichApi.reducerPath]: runnichApi.reducer,
  }),
);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(runnichApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
