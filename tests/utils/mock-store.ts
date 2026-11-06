import { configureStore, combineReducers } from '@reduxjs/toolkit';
import activity from '@R/slices/activity/activity';
import activitySettings from '@R/slices/activity-settings/activity-settings';
import auth, { setAuthSession } from '@R/slices/auth/auth';
import comment from '@R/slices/comment/comment';
import loading from '@R/slices/loading/loading';
import location from '@R/slices/location/location';
import logining from '@R/slices/logining/logining';
import mainFeed from '@R/slices/main-feed/main-feed';
import migration from '@R/slices/migration/migration';
import network from '@R/slices/network/network';
import settings from '@R/slices/settings/settings';
import subscription from '@R/slices/subscription/subscription';
import trackingRecovery from '@R/slices/tracking-recovery/tracking-recovery';
import { createProfileListenerMiddleware } from '../../redux/middleware/profile-listener';
import { runichApi } from '../../redux/runich-api/runich-api';

const rootReducer = combineReducers({
  network,
  settings,
  activitySettings,
  subscription,
  location,
  activity,
  trackingRecovery,
  mainFeed,
  migration,
  auth,
  logining,
  loading,
  comment,
  [runichApi.reducerPath]: runichApi.reducer,
});

const RESET_MOCK_LOCATION = 'tests/resetMockLocation';
const RESET_MOCK_MAIN_FEED = 'tests/resetMockMainFeed';
const RESET_MOCK_ACTIVITY_REMINDERS = 'tests/resetMockActivityReminders';
const resettableReducer = (
  state: ReturnType<typeof rootReducer> | undefined,
  action: Parameters<typeof rootReducer>[1],
) => {
  const nextState = rootReducer(state, action);
  if (action.type === RESET_MOCK_LOCATION) return { ...nextState, location: location(undefined, action) };
  if (action.type === RESET_MOCK_MAIN_FEED) return { ...nextState, mainFeed: mainFeed(undefined, action) };
  if (action.type === RESET_MOCK_ACTIVITY_REMINDERS) {
    return { ...nextState, activitySettings: { ...nextState.activitySettings, activityReminders: [] } };
  }
  return nextState;
};

export function createMockStore() {
  return configureStore({
    reducer: resettableReducer,
    middleware: (getDefaultMiddleware) => {
      const profileListenerMiddleware = createProfileListenerMiddleware();
      return getDefaultMiddleware({ serializableCheck: false }).concat(
        profileListenerMiddleware.middleware,
        runichApi.middleware,
      );
    },
  });
}

export const mockStore = createMockStore();

export const resetMockLocation = () => ({ type: RESET_MOCK_LOCATION });

export const resetMockMainFeed = () => ({ type: RESET_MOCK_MAIN_FEED });

export const resetMockActivityReminders = () => ({ type: RESET_MOCK_ACTIVITY_REMINDERS });

export const setMockUserId = (userId: string) => {
  const { accessToken, refreshToken } = mockStore.getState().auth;
  return setAuthSession({ userId, accessToken, refreshToken });
};

export type AppStore = typeof mockStore;
