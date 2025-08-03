import mainFeed from '@R/slices/main-feed/main-feed';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { runichApi } from '../../redux/runich-api/runich-api';
import profile from '@R/slices/profile/profile';
import activity from '@R/slices/activity/activity';
import location from '@R/slices/location/location';
import network from '@R/slices/network/network';
import language from '@R/slices/language/language';
import auth from '@R/slices/auth/auth';
import logining from '@R/slices/logining/logining';
import manualActivity from '@R/slices/manual-activity/manual-activity';
import { additionalInfoActivity } from '@R/slices/actitivity-additional-info/activity-additional-info';
import unsendedActivity from '@R/slices/unsended-activity/unsended-activity';
import comment from '@R/slices/comment/comment';

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
    return getDefaultMiddleware().concat(runichApi.middleware);
  },
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof mockStore;
