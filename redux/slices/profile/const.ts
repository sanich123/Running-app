import type { ProfileSlice } from './types';
import type { ProfileType } from '@S/card/types';

export const PROFILE_SETTINGS_INITIAL_STATE = {
  profilePhoto: '',
};

export const PROFILE_INITIAL_STATE: ProfileSlice = {
  isDisabledWhileSendingProfile: false,
  settings: PROFILE_SETTINGS_INITIAL_STATE,
  profileFromServer: {} as ProfileType,
};
