import { configureStore, combineReducers } from '@reduxjs/toolkit';
import activity from '@R/slices/activity/activity';
import auth from '@R/slices/auth/auth';
import comment from '@R/slices/comment/comment';
import location from '@R/slices/location/location';
import logining from '@R/slices/logining/logining';
import mainFeed from '@R/slices/main-feed/main-feed';
import network from '@R/slices/network/network';
import profile from '@R/slices/profile/profile';
import settings from '@R/slices/settings/settings';
import { createProfileListenerMiddleware } from '../../redux/middleware/profile-listener';
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
  comment,
  [runichApi.reducerPath]: runichApi.reducer,
});

export const mockStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const profileListenerMiddleware = createProfileListenerMiddleware();
    return getDefaultMiddleware({ serializableCheck: false }).concat(
      profileListenerMiddleware.middleware,
      runichApi.middleware,
    );
  },
});

export type AppStore = typeof mockStore;
