import { createListenerMiddleware } from '@reduxjs/toolkit';
import { profileApi } from '@R/services/profile/profile';
import { setIsProfileFilled } from '@R/slices/settings/settings';
import { hasProfileData } from '@Routes/activity/map/profile-status';

interface ProfileListenerState {
  auth: {
    userId: string;
  };
}

export function createProfileListenerMiddleware<State extends ProfileListenerState = ProfileListenerState>() {
  const middleware = createListenerMiddleware<State>();

  middleware.startListening({
    matcher: profileApi.endpoints.getUserProfileByUserId.matchFulfilled,
    effect: (action, listenerApi) => {
      const requestedUserId = action.meta.arg.originalArgs;
      const currentUserId = listenerApi.getState().auth.userId;

      if (requestedUserId === currentUserId) {
        listenerApi.dispatch(setIsProfileFilled(hasProfileData(action.payload)));
      }
    },
  });

  return middleware;
}
