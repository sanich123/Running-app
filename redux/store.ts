import { configureStore, combineReducers } from '@reduxjs/toolkit';

import changeThemeLangReducer from './change-lang-slice/change-lang-slice';
import { graphiqlApi } from './graphql-api/graphql-api';
import { loadState } from './localstorage-store';
import locationSlice from './location-slice/location-slice';

const rootReducer = combineReducers({
  changeThemeLang: changeThemeLangReducer,
  location: locationSlice,
  [graphiqlApi.reducerPath]: graphiqlApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(graphiqlApi.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
