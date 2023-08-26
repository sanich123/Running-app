import { configureStore, combineReducers } from '@reduxjs/toolkit';

import changeThemeLangReducer from './change-lang-slice/change-lang-slice';
import { loadState } from './localstorage-store';
import locationSlice from './location-slice/location-slice';
import { runnichApi } from './runnich-api/runnich-api';

const rootReducer = combineReducers({
  changeThemeLang: changeThemeLangReducer,
  location: locationSlice,
  [runnichApi.reducerPath]: runnichApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(runnichApi.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
