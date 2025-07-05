import mainFeed from '@R/main-feed/main-feed';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { runichApi } from '../../redux/runich-api/runich-api';
import network from '@R/network/network';
import language from '@R/language/language';
import profile from '@R/profile/profile';
import activity from '@R/activity/activity';
import location from '@R/location/location';

const rootReducer = combineReducers({
  network,
  language,
  location,
  profile,
  activity,
  mainFeed,
  [runichApi.reducerPath]: runichApi.reducer,
});

export const mockStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(runichApi.middleware);
  },
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof mockStore;
