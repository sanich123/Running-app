import { configureStore, combineReducers } from '@reduxjs/toolkit';

import activity from '../../redux/activity/activity';
import language from '../../redux/language/language';
import location from '../../redux/location/location';
import profile from '../../redux/profile/profile';
import { runichApi } from '../../redux/runich-api/runich-api';

const rootReducer = combineReducers({
  language,
  location,
  profile,
  activity,
  [runichApi.reducerPath]: runichApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(runichApi.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
