import { configureStore, combineReducers } from '@reduxjs/toolkit';
import additionalInfoActivity from '@R/slices/actitivity-additional-info/activity-additional-info';
import activity from '@R/slices/activity/activity';
import auth from '@R/slices/auth/auth';
import comment from '@R/slices/comment/comment';
import language from '@R/slices/language/language';
import location from '@R/slices/location/location';
import logining from '@R/slices/logining/logining';
import mainFeed from '@R/slices/main-feed/main-feed';
import manualActivity from '@R/slices/manual-activity/manual-activity';
import network from '@R/slices/network/network';
import profile from '@R/slices/profile/profile';
import unsendedActivity from '@R/slices/unsended-activity/unsended-activity';
import { runichApi } from '../../redux/runich-api/runich-api';

const rootReducer = combineReducers({
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

export const mockStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false }).concat(runichApi.middleware);
  },
});

export type AppStore = typeof mockStore;
