import { configureStore, combineReducers } from '@reduxjs/toolkit';
import activity from '@R/slices/activity/activity';
import additionalInfoActivity from '@R/slices/activity-additional-info/activity-additional-info';
import auth from '@R/slices/auth/auth';
import comment from '@R/slices/comment/comment';
import location from '@R/slices/location/location';
import logining from '@R/slices/logining/logining';
import mainFeed from '@R/slices/main-feed/main-feed';
import network from '@R/slices/network/network';
import profile from '@R/slices/profile/profile';
import settings from '@R/slices/settings/settings';
import unsendedActivity from '@R/slices/unsended-activity/unsended-activity';
import { runichApi } from '../../redux/runich-api/runich-api';

const rootReducer = combineReducers({
  network,
  settings,
  location,
  profile,
  activity,
  mainFeed,
  auth,
  logining,
  additionalInfoActivity,
  unsendedActivity,
  comment,
  [runichApi.reducerPath]: runichApi.reducer,
});

export const mockStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false }).concat(runichApi.middleware);
  },
});

export type AppStore = typeof mockStore;
